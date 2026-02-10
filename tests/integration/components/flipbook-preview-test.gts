import { render, type TestContext } from '@ember/test-helpers';
import { module, test } from 'qunit';
import FlipbookPreview from 'spotify-flipbook/components/flipbook-preview';
import { setupRenderingTest } from 'spotify-flipbook/tests/helpers';
import type { RenderInfo } from 'spotify-flipbook/types/flipbook';

type FlipbookPreviewTestContext = TestContext & {
  entries: RenderInfo[];
  isLoading: boolean;
};

function buildEntry(index: number): RenderInfo {
  return {
    url: `https://open.spotify.com/track/${index}`,
    customText: `Message ${index}`,
    title: `Song ${index}`,
    artists: `Artist ${index}`,
    artworkUrl: `https://i.scdn.co/image/${index}`,
    spotifyUri: `spotify:track:${index}`,
    scannableUrl: `https://scannables.scdn.co/${index}`,
  };
}

module('Integration | Component | flipbook-preview', function (hooks) {
  setupRenderingTest(hooks);

  test('it disables print when there are no entries', async function (this: FlipbookPreviewTestContext, assert) {
    this.entries = [];
    this.isLoading = false;
    const entries = this.entries;
    const isLoading = this.isLoading;

    await render(
      <template>
        <FlipbookPreview @entries={{entries}} @isLoading={{isLoading}} />
      </template>
    );

    assert.dom('[data-test-print-button]').isDisabled();
    assert.dom('[data-test-print-button]').hasText('Print');
  });

  test('it enables print when entries are rendered', async function (this: FlipbookPreviewTestContext, assert) {
    this.entries = [buildEntry(1)];
    this.isLoading = false;
    const entries = this.entries;
    const isLoading = this.isLoading;

    await render(
      <template>
        <FlipbookPreview @entries={{entries}} @isLoading={{isLoading}} />
      </template>
    );

    assert.dom('[data-test-print-button]').isNotDisabled();
  });

  test('it disables print while loading', async function (this: FlipbookPreviewTestContext, assert) {
    this.entries = [buildEntry(1)];
    this.isLoading = true;
    const entries = this.entries;
    const isLoading = this.isLoading;

    await render(
      <template>
        <FlipbookPreview @entries={{entries}} @isLoading={{isLoading}} />
      </template>
    );

    assert.dom('[data-test-print-button]').isDisabled();
  });
});
