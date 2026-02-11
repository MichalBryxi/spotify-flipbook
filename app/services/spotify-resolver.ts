import Service, { service } from '@ember/service';
import { withResponseType } from '@warp-drive/core/request';
import config from 'spotify-flipbook/config/environment';
import type Store from 'spotify-flipbook/services/store';
import type { ResolvedTrack } from 'spotify-flipbook/types/flipbook';

type SpotifyOEmbedResponse = {
  title: string;
  author_name: string;
  thumbnail_url: string;
};

type SpotifyTrackResponse = {
  name: string;
  uri: string;
  artists: Array<{ name: string }>;
  album: {
    images: Array<{ url: string }>;
  };
};

type SpotifyPlaylistResponse = {
  name: string;
  uri: string;
  images: Array<{ url: string }>;
  owner: {
    display_name: string;
  };
};

type SpotifyInputResource = {
  kind: 'track' | 'playlist';
  id: string;
};

export type ResolveTracksResult = {
  tracks: ResolvedTrack[];
  degradedReason: string | null;
};

export default class SpotifyResolverService extends Service {
  @service declare store: Store;

  async resolveTracks(
    url: string,
    signal?: AbortSignal
  ): Promise<ResolveTracksResult> {
    const resource = this.extractResource(url);

    if (!resource) {
      throw new Error('Only Spotify track and playlist URLs are supported');
    }

    if (resource.kind === 'playlist') {
      return this.resolvePlaylist(resource.id, signal);
    }

    const trackId = resource.id;
    const canonicalTrackUrl = this.buildCanonicalTrackUrl(trackId);
    const accessToken = this.spotifyAccessToken;

    if (accessToken) {
      try {
        const track = await this.resolveTrackWithSpotifyApi(
          trackId,
          accessToken,
          signal
        );

        return {
          tracks: [track],
          degradedReason: null,
        };
      } catch (error) {
        if (this.isAbortError(error)) {
          throw error;
        }

        console.warn(
          'Spotify Web API lookup failed, using oEmbed fallback',
          error
        );

        const track = await this.resolveTrackWithOEmbed(
          canonicalTrackUrl,
          trackId,
          signal
        );

        return {
          tracks: [track],
          degradedReason:
            'Spotify Web API lookup failed, so metadata was resolved via oEmbed fallback.',
        };
      }
    }

    const track = await this.resolveTrackWithOEmbed(
      canonicalTrackUrl,
      trackId,
      signal
    );

    return {
      tracks: [track],
      degradedReason: null,
    };
  }

  private async resolvePlaylist(
    playlistId: string,
    signal?: AbortSignal
  ): Promise<ResolveTracksResult> {
    const accessToken = this.spotifyAccessToken;
    const canonicalPlaylistUrl = this.buildCanonicalPlaylistUrl(playlistId);

    if (accessToken) {
      try {
        const playlist = await this.resolvePlaylistWithSpotifyApi(
          playlistId,
          accessToken,
          signal
        );

        return {
          tracks: [playlist],
          degradedReason: null,
        };
      } catch (error) {
        if (this.isAbortError(error)) {
          throw error;
        }

        console.warn(
          'Spotify Web API playlist lookup failed, using oEmbed fallback',
          error
        );

        const playlist = await this.resolvePlaylistWithOEmbed(
          canonicalPlaylistUrl,
          playlistId,
          signal
        );

        return {
          tracks: [playlist],
          degradedReason:
            'Spotify Web API lookup failed, so metadata was resolved via oEmbed fallback.',
        };
      }
    }

    const playlist = await this.resolvePlaylistWithOEmbed(
      canonicalPlaylistUrl,
      playlistId,
      signal
    );

    return {
      tracks: [playlist],
      degradedReason: null,
    };
  }

  private async resolveTrackWithSpotifyApi(
    trackId: string,
    accessToken: string,
    signal?: AbortSignal
  ): Promise<ResolvedTrack> {
    const endpoint = `https://api.spotify.com/v1/tracks/${trackId}`;

    const payload = await this.requestJson<SpotifyTrackResponse>({
      url: endpoint,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      signal,
    });

    return this.mapSpotifyTrackResponse(payload);
  }

  private async resolvePlaylistWithSpotifyApi(
    playlistId: string,
    accessToken: string,
    signal?: AbortSignal
  ): Promise<ResolvedTrack> {
    const endpoint =
      `https://api.spotify.com/v1/playlists/${playlistId}` +
      '?fields=name,uri,images(url),owner(display_name)';

    const payload = await this.requestJson<SpotifyPlaylistResponse>({
      url: endpoint,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      signal,
    });

    return {
      title: payload.name,
      artists: payload.owner.display_name,
      artworkUrl: payload.images[0]?.url ?? '',
      spotifyUri: payload.uri,
    };
  }

  private async resolvePlaylistWithOEmbed(
    url: string,
    playlistId: string,
    signal?: AbortSignal
  ): Promise<ResolvedTrack> {
    const endpoint = new URL('https://open.spotify.com/oembed');
    endpoint.searchParams.set('url', url);

    const payload = await this.requestJson<SpotifyOEmbedResponse>({
      url: endpoint.toString(),
      method: 'GET',
      signal,
    });

    return {
      title: payload.title,
      artists: payload.author_name,
      artworkUrl: payload.thumbnail_url,
      spotifyUri: `spotify:playlist:${playlistId}`,
    };
  }

  private async resolveTrackWithOEmbed(
    url: string,
    trackId: string,
    signal?: AbortSignal
  ): Promise<ResolvedTrack> {
    const endpoint = new URL('https://open.spotify.com/oembed');
    endpoint.searchParams.set('url', url);

    const payload = await this.requestJson<SpotifyOEmbedResponse>({
      url: endpoint.toString(),
      method: 'GET',
      signal,
    });

    return {
      title: payload.title,
      artists: payload.author_name,
      artworkUrl: payload.thumbnail_url,
      spotifyUri: `spotify:track:${trackId}`,
    };
  }

  private get spotifyAccessToken(): string | null {
    const { spotifyAccessToken } = config.APP as {
      spotifyAccessToken?: string;
    };

    if (
      typeof spotifyAccessToken === 'string' &&
      spotifyAccessToken.length > 0
    ) {
      return spotifyAccessToken;
    }

    return null;
  }

  private async requestJson<T>({
    url,
    method,
    headers,
    body,
    signal,
  }: {
    url: string;
    method: 'GET' | 'POST';
    headers?: Record<string, string>;
    body?: string | URLSearchParams;
    signal?: AbortSignal;
  }): Promise<T> {
    const request = {
      url,
      method,
      cacheOptions: {
        reload: true,
      },
    } as {
      url: string;
      method: 'GET' | 'POST';
      headers?: Headers;
      body?: string | URLSearchParams;
      signal?: AbortSignal;
      cacheOptions: {
        reload: true;
      };
    };

    if (headers) {
      request.headers = new Headers(headers);
    }

    if (body !== undefined) {
      request.body = body;
    }

    if (signal) {
      request.signal = signal;
    }

    const response = await this.store.requestManager.request(
      withResponseType<T>(request)
    );

    return response.content;
  }

  private extractResource(url: string): SpotifyInputResource | null {
    const parsedUrl = new URL(url);

    if (
      parsedUrl.hostname !== 'open.spotify.com' &&
      parsedUrl.hostname !== 'play.spotify.com'
    ) {
      return null;
    }

    const { pathname } = parsedUrl;
    const segments = pathname.split('/').filter(Boolean);
    const trackSegmentIndex = segments.indexOf('track');
    const playlistSegmentIndex = segments.indexOf('playlist');

    if (trackSegmentIndex >= 0) {
      const trackId = segments[trackSegmentIndex + 1];

      if (typeof trackId === 'string' && trackId.length > 0) {
        return {
          kind: 'track',
          id: trackId,
        };
      }
    }

    if (playlistSegmentIndex >= 0) {
      const playlistId = segments[playlistSegmentIndex + 1];

      if (typeof playlistId === 'string' && playlistId.length > 0) {
        return {
          kind: 'playlist',
          id: playlistId,
        };
      }
    }

    return null;
  }

  private buildCanonicalTrackUrl(trackId: string): string {
    return `https://open.spotify.com/track/${trackId}`;
  }

  private buildCanonicalPlaylistUrl(playlistId: string): string {
    return `https://open.spotify.com/playlist/${playlistId}`;
  }

  private mapSpotifyTrackResponse(
    payload: SpotifyTrackResponse
  ): ResolvedTrack {
    return {
      title: payload.name,
      artists: payload.artists.map(({ name }) => name).join(', '),
      artworkUrl: payload.album.images[0]?.url ?? '',
      spotifyUri: payload.uri,
    };
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
    'spotify-resolver': SpotifyResolverService;
  }
}
