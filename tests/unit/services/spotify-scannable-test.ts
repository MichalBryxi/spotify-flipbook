import { module, test } from 'qunit';
import { setupTest } from 'spotify-flipbook/tests/helpers';

module('Unit | Service | spotify-scannable', function (hooks) {
  setupTest(hooks);

  test('it builds the expected scannable URL', function (assert) {
    const service = this.owner.lookup('service:spotify-scannable');

    assert.strictEqual(
      service.getScannableUrl('spotify:track:4uLU6hMCjMI75M1A2tKUQC'),
      'https://scannables.scdn.co/uri/plain/svg/ffffff/black/640/spotify%3Atrack%3A4uLU6hMCjMI75M1A2tKUQC'
    );
  });
});
