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

type SpotifyTokenResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
};

type SpotifyTrackResponse = {
  name: string;
  uri: string;
  artists: Array<{ name: string }>;
  album: {
    images: Array<{ url: string }>;
  };
};

type SpotifyCredentials = {
  clientId: string;
  clientSecret: string;
};

type TokenCache = {
  accessToken: string;
  expiresAt: number;
};

export default class SpotifyResolverService extends Service {
  @service declare store: Store;

  private tokenCache: TokenCache | null = null;

  async resolveTrack(
    url: string,
    signal?: AbortSignal
  ): Promise<ResolvedTrack> {
    const trackId = this.extractTrackId(url);
    const credentials = this.spotifyCredentials;

    if (credentials) {
      try {
        return await this.resolveTrackWithSpotifyApi(
          trackId,
          credentials,
          signal
        );
      } catch (error) {
        console.warn(
          'Spotify Web API lookup failed, using oEmbed fallback',
          error
        );
      }
    }

    return this.resolveTrackWithOEmbed(url, trackId, signal);
  }

  private async resolveTrackWithSpotifyApi(
    trackId: string,
    credentials: SpotifyCredentials,
    signal?: AbortSignal
  ): Promise<ResolvedTrack> {
    const accessToken = await this.getAccessToken(credentials, signal);
    const endpoint = `https://api.spotify.com/v1/tracks/${trackId}`;

    const payload = await this.requestJson<SpotifyTrackResponse>({
      url: endpoint,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      signal,
    });

    return {
      title: payload.name,
      artists: payload.artists.map(({ name }) => name).join(', '),
      artworkUrl: payload.album.images[0]?.url ?? '',
      spotifyUri: payload.uri,
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

  private get spotifyCredentials(): SpotifyCredentials | null {
    const { spotifyClientId, spotifyClientSecret } = config.APP as {
      spotifyClientId?: string;
      spotifyClientSecret?: string;
    };

    if (
      typeof spotifyClientId === 'string' &&
      spotifyClientId.length > 0 &&
      typeof spotifyClientSecret === 'string' &&
      spotifyClientSecret.length > 0
    ) {
      return {
        clientId: spotifyClientId,
        clientSecret: spotifyClientSecret,
      };
    }

    return null;
  }

  private async getAccessToken(
    credentials: SpotifyCredentials,
    signal?: AbortSignal
  ): Promise<string> {
    if (this.tokenCache && this.tokenCache.expiresAt > Date.now() + 30_000) {
      return this.tokenCache.accessToken;
    }

    const body = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: credentials.clientId,
      client_secret: credentials.clientSecret,
    });

    const payload = await this.requestJson<SpotifyTokenResponse>({
      url: 'https://accounts.spotify.com/api/token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
      signal,
    });

    const expiresAt = Date.now() + payload.expires_in * 1000;

    this.tokenCache = {
      accessToken: payload.access_token,
      expiresAt,
    };

    return payload.access_token;
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
    const response = await this.store.request(
      withResponseType<T>({
        url,
        method,
        headers: headers ? new Headers(headers) : undefined,
        body,
        signal,
        cacheOptions: {
          reload: true,
        },
      })
    );

    return response.content;
  }

  private extractTrackId(url: string): string {
    const { pathname } = new URL(url);
    const segments = pathname.split('/').filter(Boolean);
    const trackSegmentIndex = segments.indexOf('track');

    if (trackSegmentIndex >= 0) {
      return segments[trackSegmentIndex + 1] ?? '';
    }

    return segments[1] ?? '';
  }
}

declare module '@ember/service' {
  interface Registry {
    'spotify-resolver': SpotifyResolverService;
  }
}
