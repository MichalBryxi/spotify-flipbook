import Component from '@glimmer/component';
import type { RenderInfo } from 'spotify-flipbook/types/flipbook';
import { Divider } from 'frontile';
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
      class="song-card block min-h-72 flex-col justify-between border border-zinc-300 bg-white px-3 pb-3 print:break-inside-avoid-page"
    >
      <div class="py-5">
        <Divider />
      </div>

      <div class="flex items-start justify-between">
        <div class="min-w-0">
          <img
            src={{@entry.artworkUrl}}
            alt={{this.artworkAltText}}
            class="w-full shrink-0 rounded-sm object-cover"
          />
          <h3
            class="mt-2 text-xs font-normal leading-snug text-zinc-900 line-clamp-1"
          >
            {{@entry.title}}
          </h3>
        </div>

        <div class="flex h-full items-center justify-center overflow-hidden">
          <p
            class="whitespace-nowrap text-lg font-extrabold text-stone-600 uppercase [writing-mode:vertical-lr]"
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
