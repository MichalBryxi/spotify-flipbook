import Component from '@glimmer/component';
import type { RenderInfo } from 'spotify-flipbook/types/flipbook';

interface SongCardSignature {
  Args: {
    entry: RenderInfo;
  };
}

export default class SongCardComponent extends Component<SongCardSignature> {
  get artworkAltText(): string {
    return `Album artwork for ${this.args.entry.title}`;
  }

  get scannableAltText(): string {
    return `Spotify code for ${this.args.entry.title}`;
  }

  <template>
    <article class="song-card rounded-lg border border-zinc-300 bg-white p-3">
      <div class="flex gap-3">
        <img
          src={{@entry.artworkUrl}}
          alt={{this.artworkAltText}}
          class="h-[38mm] w-[38mm] shrink-0 rounded-md object-cover"
        />

        <div class="flex min-w-0 flex-1 flex-col gap-1">
          <h3 class="song-card-title text-[10pt] font-semibold leading-tight text-zinc-900">
            {{@entry.title}}
          </h3>
          <p class="song-card-artists text-[8.5pt] leading-snug text-zinc-600">
            {{@entry.artists}}
          </p>
          <p class="song-card-message text-[8.5pt] leading-snug text-zinc-700 italic">
            {{@entry.customText}}
          </p>
        </div>
      </div>

      <div class="mt-3 flex justify-center">
        <img
          src={{@entry.scannableUrl}}
          alt={{this.scannableAltText}}
          class="h-auto w-full max-w-[58mm] object-contain"
        />
      </div>
    </article>
  </template>
}
