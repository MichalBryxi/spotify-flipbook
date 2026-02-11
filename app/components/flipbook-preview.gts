import { action } from '@ember/object';
import Component from '@glimmer/component';
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
  get entryCount(): number {
    return this.args.entries.length;
  }

  get hasEntries(): boolean {
    return this.entryCount > 0;
  }

  get isPrintDisabled(): boolean {
    return this.args.isLoading || !this.hasEntries;
  }

  @action
  onPrint(): void {
    if (this.isPrintDisabled) {
      return;
    }

    globalThis.print();
  }

  <template>
    <section class="flex h-full flex-col gap-4 p-6 lg:p-8">
      <header class="space-y-1 border-b border-zinc-200 pb-3">
        <h2 class="text-2xl font-semibold text-zinc-900">Preview</h2>
        <p class="text-xs text-zinc-500">
          {{this.entryCount}}
          printable tracks
        </p>
      </header>

      <div
        id="flipbook-preview"
        class="flex-1 overflow-auto rounded-xl border border-zinc-200 bg-zinc-100 p-4 print:border-0 print:bg-white print:p-0"
      >
        {{#if @isLoading}}
          <p
            class="rounded-lg border border-zinc-200 bg-white p-6 text-sm text-zinc-600"
          >
            Resolving track metadata line-by-line...
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

      <footer class="flex justify-end print:hidden">
        <Button
          @onPress={{this.onPrint}}
          disabled={{this.isPrintDisabled}}
          data-test-print-button
        >
          Print
        </Button>
      </footer>
    </section>
  </template>
}
