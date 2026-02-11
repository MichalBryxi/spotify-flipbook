import Component from '@glimmer/component';
import { action } from '@ember/object';
import { Button, Textarea } from 'frontile';
import type {
  FlipbookLineState,
  FlipbookLineStatus,
} from 'spotify-flipbook/types/flipbook';

interface FlipbookEditorSignature {
  Args: {
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
}

export default class FlipbookEditorComponent extends Component<FlipbookEditorSignature> {
  @action
  onInput(value: string): void {
    this.args.onInputTextChange(value);
  }

  @action
  onGenerate(): void {
    void this.args.onGenerate();
  }

  statusLabel(status: FlipbookLineStatus): string {
    if (status === 'invalid-input') {
      return 'Invalid input';
    }

    if (status === 'resolving') {
      return 'Resolving';
    }

    if (status === 'resolved') {
      return 'Resolved';
    }

    if (status === 'degraded') {
      return 'Degraded';
    }

    if (status === 'failed') {
      return 'Failed';
    }

    return 'Unvalidated';
  }

  statusClass(status: FlipbookLineStatus): string {
    if (status === 'invalid-input' || status === 'failed') {
      return 'border-rose-200 bg-rose-50 text-rose-700';
    }

    if (status === 'degraded') {
      return 'border-amber-200 bg-amber-50 text-amber-700';
    }

    if (status === 'resolved') {
      return 'border-emerald-200 bg-emerald-50 text-emerald-700';
    }

    if (status === 'resolving') {
      return 'border-blue-200 bg-blue-50 text-blue-700';
    }

    return 'border-zinc-200 bg-zinc-100 text-zinc-600';
  }

  <template>
    <section class="flex h-full flex-col gap-4 p-6 lg:p-8">
      <header class="space-y-2">
        <h1 class="text-3xl font-semibold tracking-tight text-zinc-900">
          Spotify Flipbook
        </h1>
        <p class="text-sm leading-6 text-zinc-600">
          Paste one Spotify track URL per line with a custom message after a
          comma. Generate to build a print-ready mini-booklet preview.
        </p>
      </header>

      <div class="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
        <p class="text-xs font-semibold tracking-wide text-zinc-700 uppercase">
          Line summary
        </p>
        <p class="mt-1 text-sm text-zinc-700" data-test-line-summary>
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
      </div>

      <label
        for="flipbook-input"
        class="text-xs font-semibold tracking-wide text-zinc-500 uppercase"
      >
        Input rows
      </label>

      <Textarea
        id="flipbook-input"
        class="w-full min-h-[24rem] rounded-xl border border-zinc-200 bg-white p-4 font-mono text-sm leading-6 text-zinc-900 shadow-sm focus:border-zinc-400 focus:ring-0"
        rows="20"
        @value={{@inputText}}
        @onInput={{this.onInput}}
      />

      <p class="text-xs text-zinc-500">
        Format:
        <code
          class="mx-1 rounded bg-zinc-100 px-1.5 py-1 font-mono text-[11px]"
        >
          spotifyTrackUrl,custom message
        </code>
      </p>

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

      <section
        class="min-h-0 flex-1 rounded-xl border border-zinc-200 bg-white p-3"
      >
        <h3 class="text-xs font-semibold tracking-wide text-zinc-500 uppercase">
          Line status
        </h3>
        <ul
          class="mt-2 max-h-60 space-y-2 overflow-auto pr-1"
          data-test-line-status-list
        >
          {{#if @lineStates.length}}
            {{#each @lineStates key="lineNumber" as |lineState|}}
              <li class="rounded-lg border border-zinc-200 bg-zinc-50 p-2">
                <div class="flex items-center justify-between gap-2">
                  <p class="text-xs font-medium text-zinc-700">
                    Line
                    {{lineState.lineNumber}}
                  </p>
                  <span
                    class="rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase
                      {{this.statusClass lineState.status}}"
                    data-test-line-status={{lineState.lineNumber}}
                  >
                    {{this.statusLabel lineState.status}}
                  </span>
                </div>
                <p class="mt-1 truncate font-mono text-xs text-zinc-600">
                  {{lineState.excerpt}}
                </p>
                {{#if lineState.issue}}
                  <p class="mt-1 text-xs text-zinc-700">
                    {{lineState.issue.code}}:
                    {{lineState.issue.message}}
                  </p>
                {{/if}}
              </li>
            {{/each}}
          {{else}}
            <li
              class="rounded-lg border border-dashed border-zinc-200 p-3 text-xs text-zinc-500"
            >
              No non-empty lines detected yet.
            </li>
          {{/if}}
        </ul>
      </section>
    </section>
  </template>
}
