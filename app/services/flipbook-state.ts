import Service, { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import type SpotifyResolverService from 'spotify-flipbook/services/spotify-resolver';
import type SpotifyScannableService from 'spotify-flipbook/services/spotify-scannable';
import type {
  FlipbookIssue,
  FlipbookLineState,
  RenderInfo,
} from 'spotify-flipbook/types/flipbook';
import { FLIPBOOK_EXAMPLE_INPUT } from 'spotify-flipbook/utils/flipbook-examples';
import { evaluateFlipbookLines } from 'spotify-flipbook/utils/evaluate-flipbook-lines';

export default class FlipbookStateService extends Service {
  @service declare spotifyResolver: SpotifyResolverService;
  @service declare spotifyScannable: SpotifyScannableService;

  @tracked rawText = FLIPBOOK_EXAMPLE_INPUT;
  @tracked lastGeneratedText: string | null = null;
  @tracked entries: RenderInfo[] = [];
  @tracked lineStates: FlipbookLineState[] = [];
  @tracked issues: FlipbookIssue[] = [];
  @tracked isLoading = false;

  private inFlightController: AbortController | null = null;

  constructor(...args: ConstructorParameters<typeof Service>) {
    super(...args);
    this.recomputeLineEvaluation();
  }

  get inputText(): string {
    return this.rawText;
  }

  get lineCount(): number {
    return this.lineStates.length;
  }

  get validLineCount(): number {
    return this.lineStates.filter(({ issue }) => issue === null).length;
  }

  get issueLineCount(): number {
    return this.lineStates.filter(({ issue }) => issue !== null).length;
  }

  get isStale(): boolean {
    if (this.lastGeneratedText === null) {
      return false;
    }

    return this.rawText !== this.lastGeneratedText;
  }

  setInputText(value: string): void {
    if (value === this.rawText) {
      return;
    }

    this.cancelInFlightGeneration();
    this.rawText = value;
    this.recomputeLineEvaluation();
  }

  async generate(): Promise<void> {
    this.cancelInFlightGeneration();

    const controller = new AbortController();
    this.inFlightController = controller;
    this.isLoading = true;

    const generationText = this.rawText;
    const evaluationResult = evaluateFlipbookLines(generationText);
    const lineStateByNumber = new Map(
      evaluationResult.lineStates.map((lineState) => [
        lineState.lineNumber,
        lineState,
      ])
    );

    evaluationResult.validEntries.forEach((entry) => {
      const lineState = lineStateByNumber.get(entry.lineNumber);

      if (!lineState) {
        return;
      }

      lineStateByNumber.set(entry.lineNumber, {
        ...lineState,
        status: 'resolving',
      });
    });

    this.lineStates = Array.from(lineStateByNumber.values());
    this.issues = this.sortIssues(evaluationResult.issues);

    if (evaluationResult.validEntries.length === 0) {
      this.entries = [];
      this.lastGeneratedText = generationText;
      this.finishGeneration(controller);

      return;
    }

    try {
      const resolutionResults = await Promise.allSettled(
        evaluationResult.validEntries.map(async (entry) => {
          const resolution = await this.spotifyResolver.resolveTrack(
            entry.url,
            controller.signal
          );

          return {
            entry,
            resolution,
          };
        })
      );

      if (controller.signal.aborted) {
        return;
      }

      const nextEntries: RenderInfo[] = [];
      const nextIssues = [...evaluationResult.issues];

      resolutionResults.forEach((result, index) => {
        const parsedEntry = evaluationResult.validEntries[index];

        if (!parsedEntry) {
          return;
        }

        const currentLineState = lineStateByNumber.get(parsedEntry.lineNumber);

        if (!currentLineState) {
          return;
        }

        if (result.status === 'fulfilled') {
          const { track, degradedReason } = result.value.resolution;
          const renderInfo: RenderInfo = {
            ...parsedEntry,
            ...track,
            scannableUrl: this.spotifyScannable.getScannableUrl(
              track.spotifyUri
            ),
          };

          nextEntries.push(renderInfo);

          if (degradedReason) {
            const degradedIssue: FlipbookIssue = {
              lineNumber: parsedEntry.lineNumber,
              code: 'METADATA_FALLBACK',
              severity: 'warning',
              message: degradedReason,
              suggestion:
                'Card is printable, but verify metadata if precision is important.',
              excerpt: parsedEntry.excerpt,
            };

            nextIssues.push(degradedIssue);
            lineStateByNumber.set(parsedEntry.lineNumber, {
              ...currentLineState,
              status: 'degraded',
              issue: degradedIssue,
            });

            return;
          }

          lineStateByNumber.set(parsedEntry.lineNumber, {
            ...currentLineState,
            status: 'resolved',
            issue: null,
          });

          return;
        }

        if (this.isAbortError(result.reason)) {
          return;
        }

        const failedIssue: FlipbookIssue = {
          lineNumber: parsedEntry.lineNumber,
          code: 'TRACK_RESOLUTION_FAILED',
          severity: 'error',
          message:
            'Unable to resolve this line from Spotify APIs. Check URL availability and try again.',
          suggestion:
            'Confirm the track URL opens publicly on Spotify, then regenerate.',
          excerpt: parsedEntry.excerpt,
        };

        nextIssues.push(failedIssue);
        lineStateByNumber.set(parsedEntry.lineNumber, {
          ...currentLineState,
          status: 'failed',
          issue: failedIssue,
        });
      });

      this.entries = nextEntries;
      this.lineStates = Array.from(lineStateByNumber.values());
      this.issues = this.sortIssues(nextIssues);
      this.lastGeneratedText = generationText;
    } finally {
      this.finishGeneration(controller);
    }
  }

  private recomputeLineEvaluation(): void {
    const evaluationResult = evaluateFlipbookLines(this.rawText);

    this.lineStates = evaluationResult.lineStates;
    this.issues = this.sortIssues(evaluationResult.issues);
  }

  private sortIssues(issues: FlipbookIssue[]): FlipbookIssue[] {
    return [...issues].sort(
      (left, right) => left.lineNumber - right.lineNumber
    );
  }

  private cancelInFlightGeneration(): void {
    if (!this.inFlightController) {
      return;
    }

    this.inFlightController.abort();
    this.inFlightController = null;
    this.isLoading = false;
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
