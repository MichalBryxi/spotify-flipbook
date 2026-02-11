import { module, test } from 'qunit';
import config from 'spotify-flipbook/config/environment';
import Service from '@ember/service';
import { setupTest } from 'spotify-flipbook/tests/helpers';

const TRACK_URL = 'https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC';
const TRACK_URL_WITH_QUERY =
  'https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC?si=abc123&context=spotify%3Aplaylist%3Axyz';
const PLAYLIST_URL =
  'https://open.spotify.com/playlist/2SNR0Fi1oxGMcM740jamt4?si=aa917f07c952491a';

module('Unit | Service | spotify-resolver', function (hooks) {
  setupTest(hooks);

  let originalAccessToken: string | undefined;

  hooks.beforeEach(function () {
    const appConfig = config.APP as Record<string, unknown> & {
      spotifyAccessToken?: string;
    };

    originalAccessToken = appConfig.spotifyAccessToken;
    delete appConfig.spotifyAccessToken;
  });

  hooks.afterEach(function () {
    const appConfig = config.APP as Record<string, unknown> & {
      spotifyAccessToken?: string;
    };

    if (originalAccessToken) {
      appConfig.spotifyAccessToken = originalAccessToken;
    } else {
      delete appConfig.spotifyAccessToken;
    }
  });

  test('it resolves track metadata through oEmbed when access token is missing', async function (assert) {
    assert.expect(2);

    this.owner.register(
      'service:store',
      class StoreStub extends Service {
        requestManager = {
          request: (requestConfig: { url: string }) => {
            assert.strictEqual(
              requestConfig.url,
              `https://open.spotify.com/oembed?url=${encodeURIComponent(TRACK_URL)}`
            );

            return Promise.resolve({
              request: requestConfig,
              response: null,
              content: {
                title: 'Never Gonna Give You Up',
                author_name: 'Rick Astley',
                thumbnail_url: 'https://i.scdn.co/image/cover.jpg',
              },
            });
          },
        };
      }
    );

    const service = this.owner.lookup('service:spotify-resolver');
    const result = await service.resolveTracks(TRACK_URL);

    assert.deepEqual(result, {
      tracks: [
        {
          title: 'Never Gonna Give You Up',
          artists: 'Rick Astley',
          artworkUrl: 'https://i.scdn.co/image/cover.jpg',
          spotifyUri: 'spotify:track:4uLU6hMCjMI75M1A2tKUQC',
        },
      ],
      degradedReason: null,
    });
  });

  test('it uses canonical Spotify track URL for oEmbed requests', async function (assert) {
    assert.expect(2);

    this.owner.register(
      'service:store',
      class StoreStub extends Service {
        requestManager = {
          request: (requestConfig: { url: string }) => {
            assert.strictEqual(
              requestConfig.url,
              `https://open.spotify.com/oembed?url=${encodeURIComponent(TRACK_URL)}`
            );

            return Promise.resolve({
              request: requestConfig,
              response: null,
              content: {
                title: 'Never Gonna Give You Up',
                author_name: 'Rick Astley',
                thumbnail_url: 'https://i.scdn.co/image/cover.jpg',
              },
            });
          },
        };
      }
    );

    const service = this.owner.lookup('service:spotify-resolver');
    const result = await service.resolveTracks(TRACK_URL_WITH_QUERY);

    assert.deepEqual(result, {
      tracks: [
        {
          title: 'Never Gonna Give You Up',
          artists: 'Rick Astley',
          artworkUrl: 'https://i.scdn.co/image/cover.jpg',
          spotifyUri: 'spotify:track:4uLU6hMCjMI75M1A2tKUQC',
        },
      ],
      degradedReason: null,
    });
  });

  test('it resolves track metadata through Spotify Web API when an access token is set', async function (assert) {
    assert.expect(2);

    const appConfig = config.APP as Record<string, unknown> & {
      spotifyAccessToken?: string;
    };
    appConfig.spotifyAccessToken = 'token-123';

    this.owner.register(
      'service:store',
      class StoreStub extends Service {
        requestManager = {
          request: (requestConfig: {
            url: string;
            method: string;
            headers?: Headers;
          }) => {
            if (
              requestConfig.url ===
              'https://api.spotify.com/v1/tracks/4uLU6hMCjMI75M1A2tKUQC'
            ) {
              assert.strictEqual(
                requestConfig.headers?.get('Authorization'),
                'Bearer token-123',
                'uses provided bearer token for track request'
              );

              return Promise.resolve({
                request: requestConfig,
                response: null,
                content: {
                  name: 'Never Gonna Give You Up',
                  uri: 'spotify:track:4uLU6hMCjMI75M1A2tKUQC',
                  artists: [
                    { name: 'Rick Astley' },
                    { name: 'Example Artist' },
                  ],
                  album: {
                    images: [{ url: 'https://i.scdn.co/image/high-res.jpg' }],
                  },
                },
              });
            }

            throw new Error(`Unexpected request URL: ${requestConfig.url}`);
          },
        };
      }
    );

    const service = this.owner.lookup('service:spotify-resolver');
    const result = await service.resolveTracks(TRACK_URL);

    assert.deepEqual(result, {
      tracks: [
        {
          title: 'Never Gonna Give You Up',
          artists: 'Rick Astley, Example Artist',
          artworkUrl: 'https://i.scdn.co/image/high-res.jpg',
          spotifyUri: 'spotify:track:4uLU6hMCjMI75M1A2tKUQC',
        },
      ],
      degradedReason: null,
    });
  });

  test('it falls back to oEmbed when Spotify Web API track lookup fails', async function (assert) {
    assert.expect(3);

    const appConfig = config.APP as Record<string, unknown> & {
      spotifyAccessToken?: string;
    };
    appConfig.spotifyAccessToken = 'token-123';

    this.owner.register(
      'service:store',
      class StoreStub extends Service {
        requestManager = {
          request: (requestConfig: { url: string }) => {
            if (
              requestConfig.url ===
              'https://api.spotify.com/v1/tracks/4uLU6hMCjMI75M1A2tKUQC'
            ) {
              return Promise.reject(new Error('spotify web api failure'));
            }

            assert.strictEqual(
              requestConfig.url,
              `https://open.spotify.com/oembed?url=${encodeURIComponent(TRACK_URL)}`
            );

            return Promise.resolve({
              request: requestConfig,
              response: null,
              content: {
                title: 'Never Gonna Give You Up',
                author_name: 'Rick Astley',
                thumbnail_url: 'https://i.scdn.co/image/cover.jpg',
              },
            });
          },
        };
      }
    );

    const service = this.owner.lookup('service:spotify-resolver');
    const result = await service.resolveTracks(TRACK_URL);

    assert.deepEqual(result.tracks, [
      {
        title: 'Never Gonna Give You Up',
        artists: 'Rick Astley',
        artworkUrl: 'https://i.scdn.co/image/cover.jpg',
        spotifyUri: 'spotify:track:4uLU6hMCjMI75M1A2tKUQC',
      },
    ]);
    assert.strictEqual(typeof result.degradedReason, 'string');
  });

  test('it resolves playlist tracks through Spotify Web API when an access token is set', async function (assert) {
    assert.expect(2);

    const appConfig = config.APP as Record<string, unknown> & {
      spotifyAccessToken?: string;
    };
    appConfig.spotifyAccessToken = 'token-123';

    this.owner.register(
      'service:store',
      class StoreStub extends Service {
        requestManager = {
          request: (requestConfig: { url: string; headers?: Headers }) => {
            if (
              requestConfig.url.startsWith(
                'https://api.spotify.com/v1/playlists/2SNR0Fi1oxGMcM740jamt4/tracks'
              )
            ) {
              assert.strictEqual(
                requestConfig.headers?.get('Authorization'),
                'Bearer token-123',
                'uses provided bearer token for playlist request'
              );

              return Promise.resolve({
                request: requestConfig,
                response: null,
                content: {
                  items: [
                    {
                      track: {
                        name: 'Song One',
                        uri: 'spotify:track:one',
                        artists: [{ name: 'Artist One' }],
                        album: {
                          images: [{ url: 'https://i.scdn.co/image/one.jpg' }],
                        },
                      },
                    },
                    {
                      track: {
                        name: 'Song Two',
                        uri: 'spotify:track:two',
                        artists: [{ name: 'Artist Two' }],
                        album: {
                          images: [{ url: 'https://i.scdn.co/image/two.jpg' }],
                        },
                      },
                    },
                  ],
                  next: null,
                },
              });
            }

            throw new Error(`Unexpected request URL: ${requestConfig.url}`);
          },
        };
      }
    );

    const service = this.owner.lookup('service:spotify-resolver');
    const result = await service.resolveTracks(PLAYLIST_URL);

    assert.deepEqual(result, {
      tracks: [
        {
          title: 'Song One',
          artists: 'Artist One',
          artworkUrl: 'https://i.scdn.co/image/one.jpg',
          spotifyUri: 'spotify:track:one',
        },
        {
          title: 'Song Two',
          artists: 'Artist Two',
          artworkUrl: 'https://i.scdn.co/image/two.jpg',
          spotifyUri: 'spotify:track:two',
        },
      ],
      degradedReason: null,
    });
  });

  test('it rejects playlist resolution when access token is missing', async function (assert) {
    const service = this.owner.lookup('service:spotify-resolver');

    await assert.rejects(
      service.resolveTracks(PLAYLIST_URL),
      /Playlist URLs require SPOTIFY_ACCESS_TOKEN/
    );
  });

  test('it rejects unsupported non-Spotify URLs', async function (assert) {
    const service = this.owner.lookup('service:spotify-resolver');

    await assert.rejects(
      service.resolveTracks(
        'https://podcastaddict.com/science-vs/episode/215465069'
      ),
      /Only Spotify track and playlist URLs are supported/
    );
  });
});
