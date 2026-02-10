import Service from '@ember/service';

const SCANNABLE_BASE_URL = 'https://scannables.scdn.co/uri/plain/svg/ffffff/black/640/';

export default class SpotifyScannableService extends Service {
  getScannableUrl(spotifyUri: string): string {
    return `${SCANNABLE_BASE_URL}${encodeURIComponent(spotifyUri)}`;
  }
}

declare module '@ember/service' {
  interface Registry {
    'spotify-scannable': SpotifyScannableService;
  }
}
