import Controller from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import type SpotifyResolverService from 'spotify-flipbook/services/spotify-resolver';
import type SpotifyScannableService from 'spotify-flipbook/services/spotify-scannable';
import type { ParsedEntry, RenderInfo } from 'spotify-flipbook/types/flipbook';

const EXAMPLE_INPUT = [
  'https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC,This one reminds me of our hike in Lauterbrunnen',
  'https://open.spotify.com/track/3n3Ppam7vgaVa1iaRUc9Lp,For when we need a dance break in the kitchen',
  'https://open.spotify.com/track/7lPN2DXiMsVn7XUKtOW1CS,Play this on long train rides',
  'https://open.spotify.com/track/1cTZMwcBJT0Ka3UJPXOeeN,Sunday morning coffee soundtrack',
  'https://open.spotify.com/track/2takcwOaAZWiXQijPHIx7B,Night drive anthem',
  'https://open.spotify.com/track/0VjIjW4GlUZAMYd2vXMi3b,Save this for your big wins',
].join('\n');

export default class IndexController extends Controller {
  @service declare spotifyResolver: SpotifyResolverService;
  @service declare spotifyScannable: SpotifyScannableService;

  @tracked inputText = EXAMPLE_INPUT;
  @tracked entries: RenderInfo[] = [];
  @tracked isLoading = false;

  @action
  onInputTextChange(value: string): void {
    this.inputText = value;
  }

  @action
  async onGenerate(): Promise<void> {
    this.isLoading = true;

    try {
      const parsedEntries = this.parseInput(this.inputText);
      const resolvedEntries = await Promise.all(
        parsedEntries.map(async (entry) => {
          const track = await this.spotifyResolver.resolveTrack(entry.url);

          return {
            ...entry,
            ...track,
            scannableUrl: this.spotifyScannable.getScannableUrl(track.spotifyUri),
          };
        })
      );

      this.entries = resolvedEntries;
    } catch (error) {
      // Basic visibility only, per v1 requirements.
      console.error('Unable to generate Spotify flipbook entries', error);
    } finally {
      this.isLoading = false;
    }
  }

  private parseInput(input: string): ParsedEntry[] {
    return input
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [url = '', ...customTextParts] = line.split(',');

        return {
          url: url.trim(),
          customText: customTextParts.join(',').trim(),
        };
      });
  }
}
