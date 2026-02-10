export type ParsedEntry = {
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
