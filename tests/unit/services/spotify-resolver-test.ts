import { module, test } from 'qunit';
import config from 'spotify-flipbook/config/environment';
import { setupTest } from 'spotify-flipbook/tests/helpers';

const TRACK_URL = 'https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC';

function toRequestUrl(input: RequestInfo | URL): string {
  if (typeof input === 'string') {
    return input;
  }

  if (input instanceof URL) {
    return input.toString();
  }

  return input.url;
}

module('Unit | Service | spotify-resolver', function (hooks) {
  setupTest(hooks);

  let originalFetch: typeof globalThis.fetch;
  let originalClientId: string | undefined;
  let originalClientSecret: string | undefined;

  hooks.beforeEach(function () {
    originalFetch = globalThis.fetch;

    const appConfig = config.APP as Record<string, unknown> & {
      spotifyClientId?: string;
      spotifyClientSecret?: string;
    };

    originalClientId = appConfig.spotifyClientId;
    originalClientSecret = appConfig.spotifyClientSecret;
    delete appConfig.spotifyClientId;
    delete appConfig.spotifyClientSecret;
  });

  hooks.afterEach(function () {
    globalThis.fetch = originalFetch;

    const appConfig = config.APP as Record<string, unknown> & {
      spotifyClientId?: string;
      spotifyClientSecret?: string;
    };

    if (originalClientId) {
      appConfig.spotifyClientId = originalClientId;
    } else {
      delete appConfig.spotifyClientId;
    }

    if (originalClientSecret) {
      appConfig.spotifyClientSecret = originalClientSecret;
    } else {
      delete appConfig.spotifyClientSecret;
    }
  });

  test('it resolves metadata through oEmbed when credentials are missing', async function (assert) {
    assert.expect(2);

    globalThis.fetch = (input) => {
      assert.strictEqual(
        toRequestUrl(input),
        `https://open.spotify.com/oembed?url=${encodeURIComponent(TRACK_URL)}`
      );

      return Promise.resolve(
        new Response(
          JSON.stringify({
            title: 'Never Gonna Give You Up',
            author_name: 'Rick Astley',
            thumbnail_url: 'https://i.scdn.co/image/cover.jpg',
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }
        )
      );
    };

    const service = this.owner.lookup('service:spotify-resolver');
    const result = await service.resolveTrack(TRACK_URL);

    assert.deepEqual(result, {
      title: 'Never Gonna Give You Up',
      artists: 'Rick Astley',
      artworkUrl: 'https://i.scdn.co/image/cover.jpg',
      spotifyUri: 'spotify:track:4uLU6hMCjMI75M1A2tKUQC',
    });
  });

  test('it resolves metadata through Spotify Web API when credentials are set', async function (assert) {
    assert.expect(3);

    const appConfig = config.APP as Record<string, unknown> & {
      spotifyClientId?: string;
      spotifyClientSecret?: string;
    };
    appConfig.spotifyClientId = 'client-id';
    appConfig.spotifyClientSecret = 'client-secret';

    globalThis.fetch = (input, init) => {
      const url = toRequestUrl(input);

      if (url === 'https://accounts.spotify.com/api/token') {
        assert.strictEqual(init?.method, 'POST', 'requests access token');

        return Promise.resolve(
          new Response(
            JSON.stringify({
              access_token: 'token-123',
              token_type: 'Bearer',
              expires_in: 3600,
            }),
            {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            }
          )
        );
      }

      if (url === 'https://api.spotify.com/v1/tracks/4uLU6hMCjMI75M1A2tKUQC') {
        const headers = init?.headers as Record<string, string>;
        assert.strictEqual(
          headers.Authorization,
          'Bearer token-123',
          'uses bearer token for track request'
        );

        return Promise.resolve(
          new Response(
            JSON.stringify({
              name: 'Never Gonna Give You Up',
              uri: 'spotify:track:4uLU6hMCjMI75M1A2tKUQC',
              artists: [{ name: 'Rick Astley' }, { name: 'Example Artist' }],
              album: {
                images: [{ url: 'https://i.scdn.co/image/high-res.jpg' }],
              },
            }),
            {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            }
          )
        );
      }

      throw new Error(`Unexpected request URL: ${url}`);
    };

    const service = this.owner.lookup('service:spotify-resolver');
    const result = await service.resolveTrack(TRACK_URL);

    assert.deepEqual(result, {
      title: 'Never Gonna Give You Up',
      artists: 'Rick Astley, Example Artist',
      artworkUrl: 'https://i.scdn.co/image/high-res.jpg',
      spotifyUri: 'spotify:track:4uLU6hMCjMI75M1A2tKUQC',
    });
  });
});
