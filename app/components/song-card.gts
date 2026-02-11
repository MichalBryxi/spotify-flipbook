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
    <article
      class="song-card relative flex min-h-72 flex-col justify-between border border-zinc-300 bg-white px-3 pb-3 pt-8"
    >
      <div
        class="absolute top-2 left-1/2 h-0 w-16 -translate-x-1/2 border-t border-dashed border-zinc-300"
      ></div>

      <div class="flex items-start justify-between gap-2">
        <div class="min-w-0">
          <img
            src={{@entry.artworkUrl}}
            alt={{this.artworkAltText}}
            class="h-36 w-36 shrink-0 rounded-sm object-cover"
          />
          <h3
            class="song-card-title mt-2 text-[9pt] font-normal leading-snug text-zinc-900"
          >
            {{@entry.title}}
          </h3>
          <p
            class="song-card-artists mt-1 text-[8pt] leading-snug text-zinc-600"
          >
            {{@entry.artists}}
          </p>
        </div>

        <div
          class="flex min-h-36 w-10 items-center justify-center overflow-hidden"
        >
          <p
            class="max-w-none whitespace-nowrap text-[9pt] font-extrabold leading-none text-stone-600 uppercase rotate-90"
          >
            {{@entry.customText}}
          </p>
        </div>
      </div>

      <div class="mt-2 flex justify-center">
        <img
          src={{@entry.scannableUrl}}
          alt={{this.scannableAltText}}
          class="h-auto w-full max-w-56 object-contain"
        />
      </div>
    </article>
  </template>
}
