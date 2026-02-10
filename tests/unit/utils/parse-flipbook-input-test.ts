import { module, test } from 'qunit';
import { parseFlipbookInput } from 'spotify-flipbook/utils/parse-flipbook-input';

module('Unit | Utility | parse-flipbook-input', function () {
  test('it parses lines and keeps commas in custom messages', function (assert) {
    const input = [
      'https://open.spotify.com/track/alpha,hello world',
      '',
      'https://open.spotify.com/track/bravo,message with, extra commas',
    ].join('\n');

    assert.deepEqual(parseFlipbookInput(input), [
      {
        url: 'https://open.spotify.com/track/alpha',
        customText: 'hello world',
      },
      {
        url: 'https://open.spotify.com/track/bravo',
        customText: 'message with, extra commas',
      },
    ]);
  });

  test('it trims url and custom text values', function (assert) {
    const input =
      '  https://open.spotify.com/track/charlie   ,   trimmed message   ';

    assert.deepEqual(parseFlipbookInput(input), [
      {
        url: 'https://open.spotify.com/track/charlie',
        customText: 'trimmed message',
      },
    ]);
  });
});
