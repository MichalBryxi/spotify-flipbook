import Service, { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import type SpotifyResolverService from 'spotify-flipbook/services/spotify-resolver';
import type SpotifyScannableService from 'spotify-flipbook/services/spotify-scannable';
import type { RenderInfo } from 'spotify-flipbook/types/flipbook';
import { FLIPBOOK_EXAMPLE_INPUT } from 'spotify-flipbook/utils/flipbook-examples';
import { parseFlipbookInput } from 'spotify-flipbook/utils/parse-flipbook-input';

export default class FlipbookStateService extends Service {
  @service declare spotifyResolver: SpotifyResolverService;
  @service declare spotifyScannable: SpotifyScannableService;

  @tracked inputText = FLIPBOOK_EXAMPLE_INPUT;
  @tracked entries: RenderInfo[] = [];
  @tracked isLoading = false;
  private inFlightController: AbortController | null = null;

  setInputText(value: string): void {
    this.inputText = value;
  }

  async generate(): Promise<void> {
    this.inFlightController?.abort();
    const controller = new AbortController();
    this.inFlightController = controller;

    this.isLoading = true;
    const parsedEntries = parseFlipbookInput(this.inputText);

    if (parsedEntries.length === 0) {
      this.entries = [];
      this.finishGeneration(controller);

      return;
    }

    try {
      const resolutionResults = await Promise.allSettled(
        parsedEntries.map(async (entry) => {
          const track = await this.spotifyResolver.resolveTrack(
            entry.url,
            controller.signal
          );

          return {
            ...entry,
            ...track,
            scannableUrl: this.spotifyScannable.getScannableUrl(
              track.spotifyUri
            ),
          };
        })
      );

      if (!controller.signal.aborted) {
        this.entries = resolutionResults
          .filter(
            (
              result
            ): result is PromiseFulfilledResult<RenderInfo> =>
              result.status === 'fulfilled'
          )
          .map((result) => result.value);

        resolutionResults.forEach((result, index) => {
          if (result.status === 'rejected' && !this.isAbortError(result.reason)) {
            const failedEntry = parsedEntries[index];

            console.warn(
              `Skipping unresolved entry: ${failedEntry?.url ?? 'unknown URL'}`,
              result.reason
            );
          }
        });
      }
    } catch (error) {
      if (!this.isAbortError(error)) {
        console.error('Unable to generate Spotify flipbook entries', error);
      }
    } finally {
      this.finishGeneration(controller);
    }
  }

  private finishGeneration(controller: AbortController): void {
    if (this.inFlightController === controller) {
      this.inFlightController = null;
      this.isLoading = false;
    }
  }

  private isAbortError(error: unknown): boolean {
    if (error instanceof DOMException) {
      return error.name === 'AbortError';
    }

    return false;
  }
}

declare module '@ember/service' {
  interface Registry {
    'flipbook-state': FlipbookStateService;
  }
}
