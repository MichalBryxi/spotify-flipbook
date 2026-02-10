import Component from '@glimmer/component';
import { action } from '@ember/object';
import { Button } from 'frontile';
import A4Pages from 'spotify-flipbook/components/a4-pages';
import type { RenderInfo } from 'spotify-flipbook/types/flipbook';

interface FlipbookPreviewSignature {
  Args: {
    entries: RenderInfo[];
    isLoading: boolean;
  };
}

export default class FlipbookPreviewComponent extends Component<FlipbookPreviewSignature> {
  @action
  onPrint(): void {
    globalThis.print();
  }

  <template>
    <section class="flex h-full flex-col gap-4 p-6 lg:p-8">
      <header
        class="flex items-center justify-between gap-4 border-b border-zinc-200 pb-3"
      >
        <h2 class="text-2xl font-semibold text-zinc-900">Preview</h2>

        <Button
          class="print:hidden"
          @appearance="outlined"
          @intent="default"
          @onPress={{this.onPrint}}
          data-test-print-button
        >
          Print
        </Button>
      </header>

      <div
        id="flipbook-preview"
        class="flex-1 overflow-auto rounded-xl border border-zinc-200 bg-zinc-100 p-4 print:border-0 print:bg-white print:p-0"
      >
        {{#if @isLoading}}
          <p
            class="rounded-lg border border-zinc-200 bg-white p-6 text-sm text-zinc-600"
          >
            Loading Spotify tracks...
          </p>
        {{else if @entries.length}}
          <A4Pages @entries={{@entries}} />
        {{else}}
          <p
            class="rounded-lg border border-zinc-200 bg-white p-6 text-sm text-zinc-600"
          >
            Add rows in the editor and click Generate to build your printable
            flipbook.
          </p>
        {{/if}}
      </div>
    </section>
  </template>
}
