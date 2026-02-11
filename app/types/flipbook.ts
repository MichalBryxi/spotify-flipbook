export type ParsedEntry = {
  lineNumber: number;
  rawLine: string;
  excerpt: string;
  url: string;
  customText: string;
};

export type ResolvedTrack = {
  title: string;
  artists: string;
  artworkUrl: string;
  spotifyUri: string;
};

export type TrackInfo = ParsedEntry & ResolvedTrack;

export type RenderInfo = TrackInfo & {
  scannableUrl: string;
};

export type FlipbookLineStatus =
  | 'unvalidated'
  | 'invalid-input'
  | 'resolving'
  | 'resolved'
  | 'degraded'
  | 'failed';

export type FlipbookIssueSeverity = 'error' | 'warning';

export type FlipbookIssueCode =
  | 'MISSING_COMMA'
  | 'MISSING_URL'
  | 'INVALID_URL'
  | 'UNSUPPORTED_SPOTIFY_TRACK_URL'
  | 'METADATA_FALLBACK'
  | 'TRACK_RESOLUTION_FAILED';

export type FlipbookIssue = {
  lineNumber: number;
  code: FlipbookIssueCode;
  severity: FlipbookIssueSeverity;
  message: string;
  suggestion: string | null;
  excerpt: string;
};

export type FlipbookLineState = {
  lineNumber: number;
  rawLine: string;
  excerpt: string;
  url: string | null;
  customText: string | null;
  status: FlipbookLineStatus;
  issue: FlipbookIssue | null;
};

export type LineEvaluationResult = {
  lineStates: FlipbookLineState[];
  validEntries: ParsedEntry[];
  issues: FlipbookIssue[];
};
