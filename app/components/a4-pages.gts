import Component from '@glimmer/component';
import SongCard from 'spotify-flipbook/components/song-card';
import type { RenderInfo } from 'spotify-flipbook/types/flipbook';

interface A4PagesSignature {
  Args: {
    entries: RenderInfo[];
  };
}

export default class A4PagesComponent extends Component<A4PagesSignature> {
  get entries(): RenderInfo[] {
    return this.args.entries;
  }

  <template>
    <section
      class="cards-flow-grid grid grid-cols-3 gap-3"
      data-test-cards-grid
    >
      {{#each this.entries key="@index" as |entry|}}
        <SongCard @entry={{entry}} />
      {{/each}}
    </section>
  </template>
}
