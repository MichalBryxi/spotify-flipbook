import { render, type TestContext } from '@ember/test-helpers';
import { module, test } from 'qunit';
import FlipbookPreview from 'spotify-flipbook/components/flipbook-preview';
import { setupRenderingTest } from 'spotify-flipbook/tests/helpers';
import type {
  FlipbookIssue,
  RenderInfo,
} from 'spotify-flipbook/types/flipbook';

type FlipbookPreviewTestContext = TestContext & {
  entries: RenderInfo[];
  issues: FlipbookIssue[];
  isLoading: boolean;
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

module('Integration | Component | flipbook-preview', function (hooks) {
  setupRenderingTest(hooks);

  test('it disables print when there are no entries', async function (this: FlipbookPreviewTestContext, assert) {
    this.entries = [];
    this.issues = [];
    this.isLoading = false;
    const entries = this.entries;
    const issues = this.issues;
    const isLoading = this.isLoading;

    await render(
      <template>
        <FlipbookPreview
          @entries={{entries}}
          @issues={{issues}}
          @isLoading={{isLoading}}
        />
      </template>
    );

    assert.dom('[data-test-print-button]').isDisabled();
    assert.dom('[data-test-print-button]').hasText('Print');
  });

  test('it enables print when entries are rendered', async function (this: FlipbookPreviewTestContext, assert) {
    this.entries = [buildEntry(1)];
    this.issues = [];
    this.isLoading = false;
    const entries = this.entries;
    const issues = this.issues;
    const isLoading = this.isLoading;

    await render(
      <template>
        <FlipbookPreview
          @entries={{entries}}
          @issues={{issues}}
          @isLoading={{isLoading}}
        />
      </template>
    );

    assert.dom('[data-test-print-button]').isNotDisabled();
  });

  test('it disables print while loading', async function (this: FlipbookPreviewTestContext, assert) {
    this.entries = [buildEntry(1)];
    this.issues = [];
    this.isLoading = true;
    const entries = this.entries;
    const issues = this.issues;
    const isLoading = this.isLoading;

    await render(
      <template>
        <FlipbookPreview
          @entries={{entries}}
          @issues={{issues}}
          @isLoading={{isLoading}}
        />
      </template>
    );

    assert.dom('[data-test-print-button]').isDisabled();
  });

  test('it groups issues by severity', async function (this: FlipbookPreviewTestContext, assert) {
    this.entries = [];
    this.isLoading = false;
    this.issues = [
      {
        lineNumber: 4,
        code: 'TRACK_RESOLUTION_FAILED',
        severity: 'error',
        message: 'Unable to resolve',
        suggestion: 'Check URL',
        excerpt: 'line 4',
      },
      {
        lineNumber: 2,
        code: 'METADATA_FALLBACK',
        severity: 'warning',
        message: 'Fallback used',
        suggestion: 'Verify metadata',
        excerpt: 'line 2',
      },
    ];
    const entries = this.entries;
    const issues = this.issues;
    const isLoading = this.isLoading;

    await render(
      <template>
        <FlipbookPreview
          @entries={{entries}}
          @issues={{issues}}
          @isLoading={{isLoading}}
        />
      </template>
    );

    assert.dom('[data-test-issues-panel]').exists();
    assert.dom('[data-test-error-issues]').hasTextContaining('Line 4');
    assert.dom('[data-test-warning-issues]').hasTextContaining('Line 2');
  });
});
