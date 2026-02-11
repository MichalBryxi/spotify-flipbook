import { module, test } from 'qunit';
import Service from '@ember/service';
import { setupTest } from 'spotify-flipbook/tests/helpers';
import type { ResolveTrackResult } from 'spotify-flipbook/services/spotify-resolver';

module('Unit | Service | flipbook-state', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    this.owner.register(
      'service:spotify-resolver',
      class SpotifyResolverStub extends Service {
        resolveTrack(url: string): Promise<ResolveTrackResult> {
          if (url.includes('/good-track')) {
            return Promise.resolve({
              track: {
                title: 'Good Song',
                artists: 'Good Artist',
                artworkUrl: 'https://i.scdn.co/image/good',
                spotifyUri: 'spotify:track:good-track',
              },
              degradedReason: null,
            });
          }

          if (url.includes('/warn-track')) {
            return Promise.resolve({
              track: {
                title: 'Warn Song',
                artists: 'Warn Artist',
                artworkUrl: 'https://i.scdn.co/image/warn',
                spotifyUri: 'spotify:track:warn-track',
              },
              degradedReason: 'Fallback metadata was used.',
            });
          }

          return Promise.reject(new Error('resolution failed'));
        }
      }
    );

    this.owner.register(
      'service:spotify-scannable',
      class SpotifyScannableStub extends Service {
        getScannableUrl(spotifyUri: string): string {
          return `https://scannables.scdn.co/uri/plain/svg/ffffff/black/640/${encodeURIComponent(spotifyUri)}`;
        }
      }
    );
  });

  test('it resolves valid lines and keeps failures non-blocking', async function (assert) {
    assert.expect(8);

    const service = this.owner.lookup('service:flipbook-state');
    service.setInputText(
      [
        'https://podcastaddict.com/show/abc,Invalid source',
        'https://open.spotify.com/track/good-track,Good line',
        'https://open.spotify.com/track/fail-track,Will fail',
        'https://open.spotify.com/track/warn-track,Will degrade',
      ].join('\n')
    );

    await service.generate();

    assert.strictEqual(service.entries.length, 2, 'keeps printable entries');
    assert.deepEqual(
      service.entries.map((entry) => entry.title),
      ['Good Song', 'Warn Song']
    );
    assert.strictEqual(service.lineCount, 4);
    assert.strictEqual(service.validLineCount, 1);
    assert.strictEqual(service.issueLineCount, 3);
    assert.true(
      service.issues.some(
        (issue) => issue.code === 'UNSUPPORTED_SPOTIFY_TRACK_URL'
      )
    );
    assert.true(
      service.issues.some((issue) => issue.code === 'TRACK_RESOLUTION_FAILED')
    );
    assert.true(
      service.issues.some((issue) => issue.code === 'METADATA_FALLBACK')
    );
  });

  test('it marks state as stale when input changes after generation', async function (assert) {
    assert.expect(2);

    const service = this.owner.lookup('service:flipbook-state');
    service.setInputText('https://open.spotify.com/track/good-track,Good line');

    await service.generate();
    assert.false(service.isStale);

    service.setInputText(
      [
        'https://open.spotify.com/track/good-track,Good line',
        'https://open.spotify.com/track/warn-track,Second line',
      ].join('\n')
    );

    assert.true(service.isStale);
  });
});
