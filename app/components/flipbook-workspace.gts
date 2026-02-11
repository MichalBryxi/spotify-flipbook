import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import FlipbookEditor from 'spotify-flipbook/components/flipbook-editor';
import FlipbookPreview from 'spotify-flipbook/components/flipbook-preview';
import type FlipbookStateService from 'spotify-flipbook/services/flipbook-state';

export default class FlipbookWorkspaceComponent extends Component {
  @service declare flipbookState: FlipbookStateService;

  get inputText(): string {
    return this.flipbookState.inputText;
  }

  get lineStates() {
    return this.flipbookState.lineStates;
  }

  get issues() {
    return this.flipbookState.issues;
  }

  get entries() {
    return this.flipbookState.entries;
  }

  get isLoading(): boolean {
    return this.flipbookState.isLoading;
  }

  get lineCount(): number {
    return this.flipbookState.lineCount;
  }

  get validLineCount(): number {
    return this.flipbookState.validLineCount;
  }

  get issueLineCount(): number {
    return this.flipbookState.issueLineCount;
  }

  get isStale(): boolean {
    return this.flipbookState.isStale;
  }

  @action
  onInputTextChange(value: string): void {
    this.flipbookState.setInputText(value);
  }

  @action
  async onGenerate(): Promise<void> {
    await this.flipbookState.generate();
  }

  <template>
    <main
      id="flipbook-app"
      class="min-h-screen bg-slate-50 text-zinc-900 print:min-h-0 print:bg-white"
    >
      <div
        class="mx-auto flex min-h-screen w-full max-w-[1800px] flex-col lg:flex-row"
      >
        <aside
          id="editor-panel"
          class="border-b border-zinc-200 bg-white lg:w-1/2 lg:border-r lg:border-b-0 print:hidden"
        >
          <FlipbookEditor
            @inputText={{this.inputText}}
            @isGenerating={{this.isLoading}}
            @lineStates={{this.lineStates}}
            @lineCount={{this.lineCount}}
            @validLineCount={{this.validLineCount}}
            @issueLineCount={{this.issueLineCount}}
            @isStale={{this.isStale}}
            @onInputTextChange={{this.onInputTextChange}}
            @onGenerate={{this.onGenerate}}
          />
        </aside>

        <section
          id="preview-panel"
          class="min-h-screen bg-zinc-50 lg:w-1/2 print:min-h-0 print:w-full print:bg-white"
        >
          <FlipbookPreview
            @entries={{this.entries}}
            @issues={{this.issues}}
            @isLoading={{this.isLoading}}
          />
        </section>
      </div>
    </main>
  </template>
}
