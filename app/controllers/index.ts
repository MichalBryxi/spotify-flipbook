import Controller from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import type SpotifyResolverService from 'spotify-flipbook/services/spotify-resolver';
import type SpotifyScannableService from 'spotify-flipbook/services/spotify-scannable';
import type { RenderInfo } from 'spotify-flipbook/types/flipbook';
import { FLIPBOOK_EXAMPLE_INPUT } from 'spotify-flipbook/utils/flipbook-examples';
import { parseFlipbookInput } from 'spotify-flipbook/utils/parse-flipbook-input';

export default class IndexController extends Controller {
  @service declare spotifyResolver: SpotifyResolverService;
  @service declare spotifyScannable: SpotifyScannableService;

  @tracked inputText = FLIPBOOK_EXAMPLE_INPUT;
  @tracked entries: RenderInfo[] = [];
  @tracked isLoading = false;
  private generationId = 0;

  @action
  onInputTextChange(value: string): void {
    this.inputText = value;
  }

  @action
  async onGenerate(): Promise<void> {
    const currentGenerationId = ++this.generationId;
    this.isLoading = true;
    const parsedEntries = parseFlipbookInput(this.inputText);

    if (parsedEntries.length === 0) {
      this.entries = [];
      this.isLoading = false;

      return;
    }

    try {
      const resolvedEntries = await Promise.all(
        parsedEntries.map(async (entry) => {
          const track = await this.spotifyResolver.resolveTrack(entry.url);

          return {
            ...entry,
            ...track,
            scannableUrl: this.spotifyScannable.getScannableUrl(
              track.spotifyUri
            ),
          };
        })
      );

      if (currentGenerationId === this.generationId) {
        this.entries = resolvedEntries;
      }
    } catch (error) {
      // Basic visibility only, per v1 requirements.
      console.error('Unable to generate Spotify flipbook entries', error);
    } finally {
      if (currentGenerationId === this.generationId) {
        this.isLoading = false;
      }
    }
  }
}
