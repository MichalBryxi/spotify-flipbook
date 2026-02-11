import { render, type TestContext } from '@ember/test-helpers';
import { module, test } from 'qunit';
import FlipbookEditor from 'spotify-flipbook/components/flipbook-editor';
import { setupRenderingTest } from 'spotify-flipbook/tests/helpers';
import type { FlipbookIssue } from 'spotify-flipbook/types/flipbook';

type FlipbookEditorTestContext = TestContext & {
  inputText: string;
  isGenerating: boolean;
  issues: FlipbookIssue[];
  lineCount: number;
  validLineCount: number;
  issueLineCount: number;
  isStale: boolean;
  onInputTextChange: (value: string) => void;
  onGenerate: () => Promise<void>;
};

module('Integration | Component | flipbook-editor', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders summary, line numbers, and stale warning', async function (this: FlipbookEditorTestContext, assert) {
    this.inputText = [
      'https://open.spotify.com/track/abc123,Hello',
      'https://open.spotify.com/track/def456,World',
    ].join('\n');
    this.isGenerating = false;
    this.issues = [];
    this.lineCount = 2;
    this.validLineCount = 2;
    this.issueLineCount = 0;
    this.isStale = true;
    this.onInputTextChange = () => {};
    this.onGenerate = async () => {};

    const inputText = this.inputText;
    const isGenerating = this.isGenerating;
    const issues = this.issues;
    const lineCount = this.lineCount;
    const validLineCount = this.validLineCount;
    const issueLineCount = this.issueLineCount;
    const isStale = this.isStale;
    const onInputTextChange = this.onInputTextChange;
    const onGenerate = this.onGenerate;

    await render(
      <template>
        <FlipbookEditor
          @inputText={{inputText}}
          @isGenerating={{isGenerating}}
          @issues={{issues}}
          @lineCount={{lineCount}}
          @validLineCount={{validLineCount}}
          @issueLineCount={{issueLineCount}}
          @isStale={{isStale}}
          @onInputTextChange={{onInputTextChange}}
          @onGenerate={{onGenerate}}
        />
      </template>
    );

    assert
      .dom('[data-test-line-summary]')
      .hasTextContaining('2 lines detected • 2 valid, 0 with issues');
    assert
      .dom('[data-test-stale-warning]')
      .hasTextContaining('Input changed since last generation.');
    assert.dom('[data-test-line-numbers]').hasText('1\n2');
    assert.dom('[data-test-editor-issues-panel]').doesNotExist();
  });

  test('it highlights summary and shows issues when present', async function (this: FlipbookEditorTestContext, assert) {
    this.inputText = 'https://open.spotify.com/track/abc123,Hello';
    this.isGenerating = false;
    this.issues = [
      {
        lineNumber: 1,
        code: 'TRACK_RESOLUTION_FAILED',
        severity: 'error',
        message: 'Unable to resolve',
        suggestion: 'Check URL',
        excerpt: 'line 1',
      },
    ];
    this.lineCount = 1;
    this.validLineCount = 0;
    this.issueLineCount = 1;
    this.isStale = false;
    this.onInputTextChange = () => {};
    this.onGenerate = async () => {};

    const inputText = this.inputText;
    const isGenerating = this.isGenerating;
    const issues = this.issues;
    const lineCount = this.lineCount;
    const validLineCount = this.validLineCount;
    const issueLineCount = this.issueLineCount;
    const isStale = this.isStale;
    const onInputTextChange = this.onInputTextChange;
    const onGenerate = this.onGenerate;

    await render(
      <template>
        <FlipbookEditor
          @inputText={{inputText}}
          @isGenerating={{isGenerating}}
          @issues={{issues}}
          @lineCount={{lineCount}}
          @validLineCount={{validLineCount}}
          @issueLineCount={{issueLineCount}}
          @isStale={{isStale}}
          @onInputTextChange={{onInputTextChange}}
          @onGenerate={{onGenerate}}
        />
      </template>
    );

    assert
      .dom('[data-test-editor-summary-and-issues]')
      .hasClass('border-rose-200');
    assert.dom('[data-test-editor-issues-panel]').exists();
    assert.dom('[data-test-error-issues]').hasTextContaining('Line 1');
  });
});
