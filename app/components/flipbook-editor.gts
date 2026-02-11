import { on } from '@ember/modifier';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { Button } from 'frontile';
import type { FlipbookIssue } from 'spotify-flipbook/types/flipbook';

interface FlipbookEditorSignature {
  Args: {
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
}

export default class FlipbookEditorComponent extends Component<FlipbookEditorSignature> {
  @tracked gutterScrollTop = 0;

  get hasIssues(): boolean {
    return this.args.issueLineCount > 0;
  }

  get displayLineCount(): number {
    return Math.max(1, this.args.inputText.split('\n').length);
  }

  get lineNumberText(): string {
    return Array.from(
      { length: this.displayLineCount },
      (_, index) => index + 1
    ).join('\n');
  }

  get gutterStyle(): string {
    return `transform: translateY(-${this.gutterScrollTop}px);`;
  }

  get summaryTextClass(): string {
    if (this.hasIssues) {
      return 'text-rose-700';
    }

    return 'text-zinc-700';
  }

  get summaryBoxClass(): string {
    if (this.hasIssues) {
      return 'border-rose-200 bg-rose-50';
    }

    return 'border-zinc-200 bg-zinc-50';
  }

  get errorIssues(): FlipbookIssue[] {
    return this.args.issues.filter((issue) => issue.severity === 'error');
  }

  get warningIssues(): FlipbookIssue[] {
    return this.args.issues.filter((issue) => issue.severity === 'warning');
  }

  @action
  onInput(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    this.args.onInputTextChange(textarea.value);
  }

  @action
  onTextareaScroll(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    this.gutterScrollTop = textarea.scrollTop;
  }

  @action
  onGenerate(): void {
    void this.args.onGenerate();
  }

  <template>
    <section class="flex h-full flex-col gap-4 p-6 lg:p-8">
      <header class="space-y-2">
        <h1 class="text-3xl font-semibold tracking-tight text-zinc-900">
          Spotify Flipbook
        </h1>
        <p class="text-sm leading-6 text-zinc-600">
          Paste one Spotify track or playlist URL per line with a custom message
          after a comma. Generate to build a print-ready mini-booklet preview.
        </p>
      </header>

      <label
        for="flipbook-input"
        class="text-xs font-semibold tracking-wide text-zinc-500 uppercase"
      >
        Input rows
      </label>

      <div
        class="relative min-h-[24rem] overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm"
      >
        <div
          class="pointer-events-none absolute inset-y-0 left-0 w-12 border-r border-zinc-200 bg-zinc-50 font-mono text-xs leading-6 text-zinc-500"
        >
          <pre
            class="px-2 py-4 text-right"
            style={{this.gutterStyle}}
            data-test-line-numbers
          >{{this.lineNumberText}}</pre>
        </div>

        <textarea
          id="flipbook-input"
          class="h-full min-h-[24rem] w-full resize-y overflow-x-auto pl-14 pr-4 py-4 font-mono text-sm leading-6 whitespace-pre text-zinc-900 focus:outline-none"
          rows="5"
          wrap="off"
          value={{@inputText}}
          data-test-input-textarea
          {{on "input" this.onInput}}
          {{on "scroll" this.onTextareaScroll}}
        ></textarea>
      </div>

      <p class="text-xs text-zinc-500">
        Format:
        <code
          class="mx-1 rounded bg-zinc-100 px-1.5 py-1 font-mono text-[11px]"
        >
          spotifyTrackOrPlaylistUrl,custom message
        </code>
      </p>

      <section
        class="rounded-xl border p-4 {{this.summaryBoxClass}}"
        data-test-editor-summary-and-issues
      >
        <p
          class="text-xs font-semibold tracking-wide uppercase
            {{if this.hasIssues 'text-rose-700' 'text-zinc-700'}}"
        >
          Line summary
        </p>
        <p
          class="mt-1 text-sm {{this.summaryTextClass}}"
          data-test-line-summary
        >
          {{@lineCount}}
          lines detected •
          {{@validLineCount}}
          valid,
          {{@issueLineCount}}
          with issues
        </p>

        {{#if @isStale}}
          <p
            class="mt-2 rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-xs text-amber-700"
            data-test-stale-warning
          >
            Input changed since last generation.
          </p>
        {{/if}}

        {{#if this.hasIssues}}
          <div
            class="mt-4 border-t border-zinc-200 pt-3"
            data-test-editor-issues-panel
          >
            {{#if this.errorIssues.length}}
              <div class="mb-4" data-test-error-issues>
                <p
                  class="mb-2 text-xs font-semibold tracking-wide text-rose-700 uppercase"
                >
                  Errors
                </p>
                <ul class="space-y-2">
                  {{#each this.errorIssues key="lineNumber" as |issue|}}
                    <li
                      class="rounded-lg border border-rose-200 bg-rose-50 p-3"
                    >
                      <p class="text-xs font-semibold text-rose-700">
                        Line
                        {{issue.lineNumber}}
                        •
                        {{issue.code}}
                      </p>
                      <p
                        class="mt-1 text-sm text-zinc-800"
                      >{{issue.message}}</p>
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
                      <p
                        class="mt-1 text-sm text-zinc-800"
                      >{{issue.message}}</p>
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
          </div>
        {{/if}}
      </section>

      <Button
        @intent="primary"
        @size="lg"
        @class="w-full justify-center"
        @onPress={{this.onGenerate}}
        disabled={{@isGenerating}}
        data-test-generate-button
      >
        {{if @isGenerating "Generating..." "Generate"}}
      </Button>
    </section>
  </template>
}
