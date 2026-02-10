import Service from '@ember/service';
import type { ResolvedTrack } from 'spotify-flipbook/types/flipbook';

type SpotifyOEmbedResponse = {
  title: string;
  author_name: string;
  thumbnail_url: string;
};

export default class SpotifyResolverService extends Service {
  async resolveTrack(url: string): Promise<ResolvedTrack> {
    const endpoint = new URL('https://open.spotify.com/oembed');
    endpoint.searchParams.set('url', url);

    // eslint-disable-next-line warp-drive/no-external-request-patterns
    const response = await fetch(endpoint.toString());
    const payload = (await response.json()) as SpotifyOEmbedResponse;

    return {
      title: payload.title,
      artists: payload.author_name,
      artworkUrl: payload.thumbnail_url,
      spotifyUri: `spotify:track:${this.extractTrackId(url)}`,
    };
  }

  private extractTrackId(url: string): string {
    const { pathname } = new URL(url);
    const segments = pathname.split('/').filter(Boolean);

    return segments[1] ?? '';
  }
}

declare module '@ember/service' {
  interface Registry {
    'spotify-resolver': SpotifyResolverService;
  }
}
