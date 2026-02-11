import Component from '@glimmer/component';
import { action } from '@ember/object';
import { Button } from 'frontile';
import A4Pages from 'spotify-flipbook/components/a4-pages';
import type {
  FlipbookIssue,
  RenderInfo,
} from 'spotify-flipbook/types/flipbook';
import { CARDS_PER_PAGE } from 'spotify-flipbook/utils/flipbook-layout';

interface FlipbookPreviewSignature {
  Args: {
    entries: RenderInfo[];
    issues: FlipbookIssue[];
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

  get pageCount(): number {
    if (!this.hasEntries) {
      return 0;
    }

    return Math.ceil(this.entryCount / CARDS_PER_PAGE);
  }

  get hasIssues(): boolean {
    return this.args.issues.length > 0;
  }

  get errorIssues(): FlipbookIssue[] {
    return this.args.issues
      .filter((issue) => issue.severity === 'error')
      .sort((left, right) => left.lineNumber - right.lineNumber);
  }

  get warningIssues(): FlipbookIssue[] {
    return this.args.issues
      .filter((issue) => issue.severity === 'warning')
      .sort((left, right) => left.lineNumber - right.lineNumber);
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
          {{#if this.hasEntries}}
            •
            {{this.pageCount}}
            pages
          {{/if}}
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

      <div
        class="rounded-xl border border-zinc-200 bg-white p-4 print:hidden"
        data-test-issues-panel
      >
        <div class="mb-3 flex items-center justify-between gap-2">
          <h3 class="text-sm font-semibold text-zinc-900">Line issues</h3>
          <p class="text-xs text-zinc-500">
            {{@issues.length}}
            total
          </p>
        </div>

        {{#if this.hasIssues}}
          {{#if this.errorIssues.length}}
            <div class="mb-4" data-test-error-issues>
              <p
                class="mb-2 text-xs font-semibold tracking-wide text-rose-700 uppercase"
              >
                Errors
              </p>
              <ul class="space-y-2">
                {{#each this.errorIssues key="lineNumber" as |issue|}}
                  <li class="rounded-lg border border-rose-200 bg-rose-50 p-3">
                    <p class="text-xs font-semibold text-rose-700">
                      Line
                      {{issue.lineNumber}}
                      •
                      {{issue.code}}
                    </p>
                    <p class="mt-1 text-sm text-zinc-800">{{issue.message}}</p>
                    {{#if issue.suggestion}}
                      <p class="mt-1 text-xs text-zinc-600">
                        Fix:
                        {{issue.suggestion}}
                      </p>
                    {{/if}}
                    <p class="mt-1 truncate font-mono text-xs text-zinc-600">
                      {{issue.excerpt}}
                    </p>
                  </li>
                {{/each}}
              </ul>
            </div>
          {{/if}}

          {{#if this.warningIssues.length}}
            <div data-test-warning-issues>
              <p
                class="mb-2 text-xs font-semibold tracking-wide text-amber-700 uppercase"
              >
                Warnings
              </p>
              <ul class="space-y-2">
                {{#each this.warningIssues key="lineNumber" as |issue|}}
                  <li
                    class="rounded-lg border border-amber-200 bg-amber-50 p-3"
                  >
                    <p class="text-xs font-semibold text-amber-700">
                      Line
                      {{issue.lineNumber}}
                      •
                      {{issue.code}}
                    </p>
                    <p class="mt-1 text-sm text-zinc-800">{{issue.message}}</p>
                    {{#if issue.suggestion}}
                      <p class="mt-1 text-xs text-zinc-600">
                        Fix:
                        {{issue.suggestion}}
                      </p>
                    {{/if}}
                    <p class="mt-1 truncate font-mono text-xs text-zinc-600">
                      {{issue.excerpt}}
                    </p>
                  </li>
                {{/each}}
              </ul>
            </div>
          {{/if}}
        {{else}}
          <p class="text-sm text-zinc-600">
            No issues detected for current input lines.
          </p>
        {{/if}}
      </div>

      <footer class="flex justify-end print:hidden">
        <Button
          @appearance="outlined"
          @intent="default"
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
