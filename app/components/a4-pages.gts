import Component from '@glimmer/component';
import SongCard from 'spotify-flipbook/components/song-card';
import type { RenderInfo } from 'spotify-flipbook/types/flipbook';
import { CARDS_PER_PAGE } from 'spotify-flipbook/utils/flipbook-layout';

interface A4PagesSignature {
  Args: {
    entries: RenderInfo[];
  };
}

export default class A4PagesComponent extends Component<A4PagesSignature> {
  get pages(): RenderInfo[][] {
    const pages: RenderInfo[][] = [];

    for (let index = 0; index < this.args.entries.length; index += CARDS_PER_PAGE) {
      pages.push(this.args.entries.slice(index, index + CARDS_PER_PAGE));
    }

    return pages;
  }

  <template>
    {{#each this.pages key="@index" as |entries|}}
      <section class="page mx-auto w-full max-w-[210mm] bg-white p-4 shadow-sm">
        <div class="grid grid-cols-2 gap-3">
          {{#each entries key="@index" as |entry|}}
            <SongCard @entry={{entry}} />
          {{/each}}
        </div>
      </section>
    {{/each}}
  </template>
}
