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
      class="song-card flex h-[64mm] flex-col justify-between rounded-lg border border-zinc-300 bg-white p-[3mm]"
    >
      <div class="flex items-start justify-between gap-2">
        <div class="min-w-0">
          <img
            src={{@entry.artworkUrl}}
            alt={{this.artworkAltText}}
            class="h-[34mm] w-[34mm] shrink-0 rounded-md object-cover"
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
          class="flex min-h-[34mm] w-[11mm] items-center justify-center overflow-hidden"
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
          class="h-auto w-full max-w-[58mm] object-contain"
        />
      </div>
    </article>
  </template>
}
