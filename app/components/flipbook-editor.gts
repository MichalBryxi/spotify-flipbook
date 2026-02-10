import Component from '@glimmer/component';
import { action } from '@ember/object';
import { Button, Textarea } from 'frontile';

interface FlipbookEditorSignature {
  Args: {
    inputText: string;
    isGenerating: boolean;
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

      <label
        for="flipbook-input"
        class="text-xs font-semibold tracking-wide text-zinc-500 uppercase"
      >
        Input rows
      </label>

      <Textarea
        id="flipbook-input"
        class="w-full min-h-[28rem] rounded-xl border border-zinc-200 bg-white p-4 font-mono text-sm leading-6 text-zinc-900 shadow-sm focus:border-zinc-400 focus:ring-0"
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
    </section>
  </template>
}
