import type {
  FlipbookIssue,
  FlipbookLineState,
  LineEvaluationResult,
  ParsedEntry,
} from 'spotify-flipbook/types/flipbook';

const SPOTIFY_HOSTS = new Set(['open.spotify.com', 'play.spotify.com']);
const EXCERPT_MAX_LENGTH = 120;

export function evaluateFlipbookLines(rawText: string): LineEvaluationResult {
  const lineStates: FlipbookLineState[] = [];
  const validEntries: ParsedEntry[] = [];
  const issues: FlipbookIssue[] = [];

  rawText.split('\n').forEach((rawLine, index) => {
    const lineNumber = index + 1;
    const trimmedLine = rawLine.trim();

    if (trimmedLine.length === 0) {
      return;
    }

    const excerpt = buildExcerpt(trimmedLine);
    const commaIndex = trimmedLine.indexOf(',');

    if (commaIndex < 0) {
      const issue = buildIssue({
        lineNumber,
        code: 'MISSING_COMMA',
        severity: 'error',
        message: 'Line must contain a comma separating URL and custom message.',
        suggestion:
          'Use the format spotifyTrackOrPlaylistUrl,custom message on this line.',
        excerpt,
      });

      lineStates.push(
        buildInvalidLineState({
          lineNumber,
          rawLine,
          excerpt,
          issue,
        })
      );
      issues.push(issue);

      return;
    }

    const url = trimmedLine.slice(0, commaIndex).trim();
    const customText = trimmedLine.slice(commaIndex + 1).trim();

    if (url.length === 0) {
      const issue = buildIssue({
        lineNumber,
        code: 'MISSING_URL',
        severity: 'error',
        message: 'Spotify URL is missing before the comma.',
        suggestion:
          'Add a full Spotify track or playlist URL before the comma.',
        excerpt,
      });

      lineStates.push(
        buildInvalidLineState({
          lineNumber,
          rawLine,
          excerpt,
          issue,
        })
      );
      issues.push(issue);

      return;
    }

    let parsedUrl: URL;

    try {
      parsedUrl = new URL(url);
    } catch {
      const issue = buildIssue({
        lineNumber,
        code: 'INVALID_URL',
        severity: 'error',
        message: 'URL is not valid and cannot be parsed.',
        suggestion:
          'Use a full Spotify URL such as https://open.spotify.com/track/{id}.',
        excerpt,
      });

      lineStates.push(
        buildInvalidLineState({
          lineNumber,
          rawLine,
          excerpt,
          issue,
        })
      );
      issues.push(issue);

      return;
    }

    if (!isSupportedSpotifyUrl(parsedUrl)) {
      const issue = buildIssue({
        lineNumber,
        code: 'UNSUPPORTED_SPOTIFY_TRACK_URL',
        severity: 'error',
        message:
          'Only Spotify track and playlist URLs are supported for flipbook cards.',
        suggestion:
          'Use an open.spotify.com/track/... or /playlist/... URL and keep the custom message after the comma.',
        excerpt,
      });

      lineStates.push(
        buildInvalidLineState({
          lineNumber,
          rawLine,
          excerpt,
          issue,
        })
      );
      issues.push(issue);

      return;
    }

    const parsedEntry: ParsedEntry = {
      lineNumber,
      rawLine,
      excerpt,
      url,
      customText,
    };

    validEntries.push(parsedEntry);
    lineStates.push({
      lineNumber,
      rawLine,
      excerpt,
      url,
      customText,
      status: 'unvalidated',
      issue: null,
    });
  });

  return {
    lineStates,
    validEntries,
    issues,
  };
}

function isSupportedSpotifyUrl(url: URL): boolean {
  if (!SPOTIFY_HOSTS.has(url.hostname)) {
    return false;
  }

  const segments = url.pathname.split('/').filter(Boolean);

  const resource = segments[0];
  const id = segments[1];

  if (resource !== 'track' && resource !== 'playlist') {
    return false;
  }

  return typeof id === 'string' && id.length > 0;
}

function buildExcerpt(line: string): string {
  if (line.length <= EXCERPT_MAX_LENGTH) {
    return line;
  }

  return `${line.slice(0, EXCERPT_MAX_LENGTH - 1)}…`;
}

function buildIssue(issue: FlipbookIssue): FlipbookIssue {
  return issue;
}

function buildInvalidLineState({
  lineNumber,
  rawLine,
  excerpt,
  issue,
}: {
  lineNumber: number;
  rawLine: string;
  excerpt: string;
  issue: FlipbookIssue;
}): FlipbookLineState {
  return {
    lineNumber,
    rawLine,
    excerpt,
    url: null,
    customText: null,
    status: 'invalid-input',
    issue,
  };
}
