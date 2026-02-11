import { render, type TestContext } from '@ember/test-helpers';
import { module, test } from 'qunit';
import A4Pages from 'spotify-flipbook/components/a4-pages';
import { setupRenderingTest } from 'spotify-flipbook/tests/helpers';
import type { RenderInfo } from 'spotify-flipbook/types/flipbook';

type A4PagesTestContext = TestContext & {
  entries: RenderInfo[];
};

function buildEntry(index: number): RenderInfo {
  return {
    url: `https://open.spotify.com/track/${index}`,
    customText: `Message ${index}`,
    lineNumber: index,
    rawLine: `https://open.spotify.com/track/${index},Message ${index}`,
    excerpt: `https://open.spotify.com/track/${index},Message ${index}`,
    title: `Song ${index}`,
    artists: `Artist ${index}`,
    artworkUrl: `https://i.scdn.co/image/${index}`,
    spotifyUri: `spotify:track:${index}`,
    scannableUrl: `https://scannables.scdn.co/${index}`,
  };
}

module('Integration | Component | a4-pages', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders entries in a continuous card grid', async function (this: A4PagesTestContext, assert) {
    this.entries = [buildEntry(1), buildEntry(2)];
    const entries = this.entries;

    await render(<template><A4Pages @entries={{entries}} /></template>);

    assert.dom('[data-test-cards-grid]').exists({ count: 1 });
    assert.dom('.song-card').exists({ count: 2 });
    assert.dom('[data-test-card-placeholder]').doesNotExist();
  });

  test('it flows all rows without page wrappers', async function (this: A4PagesTestContext, assert) {
    this.entries = Array.from({ length: 9 }, (_, index) =>
      buildEntry(index + 1)
    );
    const entries = this.entries;

    await render(<template><A4Pages @entries={{entries}} /></template>);

    assert.dom('[data-test-cards-grid]').exists({ count: 1 });
    assert.dom('.song-card').exists({ count: 9 });
    assert.dom('[data-test-card-placeholder]').doesNotExist();
  });
});
