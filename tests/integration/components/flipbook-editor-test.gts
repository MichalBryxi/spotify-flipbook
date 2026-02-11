import { render, type TestContext } from '@ember/test-helpers';
import { module, test } from 'qunit';
import FlipbookEditor from 'spotify-flipbook/components/flipbook-editor';
import { setupRenderingTest } from 'spotify-flipbook/tests/helpers';
import type { FlipbookLineState } from 'spotify-flipbook/types/flipbook';

type FlipbookEditorTestContext = TestContext & {
  inputText: string;
  isGenerating: boolean;
  lineStates: FlipbookLineState[];
  lineCount: number;
  validLineCount: number;
  issueLineCount: number;
  isStale: boolean;
  onInputTextChange: (value: string) => void;
  onGenerate: () => Promise<void>;
};

module('Integration | Component | flipbook-editor', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders line summary and stale warning', async function (this: FlipbookEditorTestContext, assert) {
    this.inputText = 'https://open.spotify.com/track/abc123,Hello';
    this.isGenerating = false;
    this.lineStates = [
      {
        lineNumber: 1,
        rawLine: this.inputText,
        excerpt: this.inputText,
        url: 'https://open.spotify.com/track/abc123',
        customText: 'Hello',
        status: 'unvalidated',
        issue: null,
      },
    ];
    this.lineCount = 1;
    this.validLineCount = 1;
    this.issueLineCount = 0;
    this.isStale = true;
    this.onInputTextChange = () => {};
    this.onGenerate = async () => {};

    const inputText = this.inputText;
    const isGenerating = this.isGenerating;
    const lineStates = this.lineStates;
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
          @lineStates={{lineStates}}
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
      .hasTextContaining('1 lines detected • 1 valid, 0 with issues');
    assert
      .dom('[data-test-stale-warning]')
      .hasTextContaining('Input changed since last generation.');
    assert.dom('[data-test-line-status="1"]').hasText('Unvalidated');
  });
});
