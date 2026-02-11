import { module, test } from 'qunit';
import { evaluateFlipbookLines } from 'spotify-flipbook/utils/evaluate-flipbook-lines';

module('Unit | Utility | evaluate-flipbook-lines', function () {
  test('it validates lines and reports invalid input issues with line numbers', function (assert) {
    const input = [
      'https://open.spotify.com/track/abc123,hello',
      'https://open.spotify.com/playlist/xyz789,party set',
      'missing comma here',
      'https://podcastaddict.com/science-vs/episode/215465069,invalid source',
    ].join('\n');

    const result = evaluateFlipbookLines(input);

    assert.strictEqual(result.lineStates.length, 4);
    assert.strictEqual(result.validEntries.length, 2);
    assert.deepEqual(
      result.issues.map(({ lineNumber, code }) => ({ lineNumber, code })),
      [
        { lineNumber: 3, code: 'MISSING_COMMA' },
        { lineNumber: 4, code: 'UNSUPPORTED_SPOTIFY_TRACK_URL' },
      ]
    );
  });

  test('it ignores empty lines while preserving original line numbers', function (assert) {
    const input = [
      '',
      'https://open.spotify.com/track/abc123,hello',
      '',
      'https://open.spotify.com/track/def456,world',
    ].join('\n');

    const result = evaluateFlipbookLines(input);

    assert.deepEqual(
      result.validEntries.map(({ lineNumber }) => lineNumber),
      [2, 4]
    );
  });
});
