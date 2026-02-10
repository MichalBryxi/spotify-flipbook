import Component from '@glimmer/component';
import SongCard from 'spotify-flipbook/components/song-card';
import type { RenderInfo } from 'spotify-flipbook/types/flipbook';
import { CARDS_PER_PAGE } from 'spotify-flipbook/utils/flipbook-layout';

type PageSlot = RenderInfo | null;

interface A4PagesSignature {
  Args: {
    entries: RenderInfo[];
  };
}

export default class A4PagesComponent extends Component<A4PagesSignature> {
  get pages(): PageSlot[][] {
    const pages: PageSlot[][] = [];

    for (
      let index = 0;
      index < this.args.entries.length;
      index += CARDS_PER_PAGE
    ) {
      const page: PageSlot[] = this.args.entries.slice(
        index,
        index + CARDS_PER_PAGE
      );

      while (page.length < CARDS_PER_PAGE) {
        page.push(null);
      }

      pages.push(page);
    }

    return pages;
  }

  <template>
    {{#each this.pages key="@index" as |entries|}}
      <section
        class="page mx-auto mb-4 w-full max-w-[210mm] bg-white p-[6mm] shadow-sm"
      >
        <div class="grid grid-cols-2 gap-[3mm]">
          {{#each entries key="@index" as |slot|}}
            {{#if slot}}
              <SongCard @entry={{slot}} />
            {{else}}
              <div
                class="h-[64mm] rounded-lg border border-dashed border-zinc-200 bg-zinc-50 print:border-transparent print:bg-transparent"
              ></div>
            {{/if}}
          {{/each}}
        </div>
      </section>
    {{/each}}
  </template>
}
