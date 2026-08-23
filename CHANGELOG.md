# Changelog

All notable changes to this project are documented in this file.

## [1.2.0] - 2026-08-23
### Added
- Spotify share links (open.spotify.com/s/...) can now be used as input; they are resolved to the underlying track or playlist automatically.
- Locale-prefixed Spotify URLs (e.g. open.spotify.com/intl-de/track/...) are now accepted.

### Fixed
- Artist name no longer disappears silently when Spotify's oEmbed fallback omits it; resolution stays stable instead of producing an invalid value.

## [1.1.0] - 2026-02-11
### Added
- Playlist URLs can now be used as input.
- Playlist links generate a single printable card using playlist metadata and a playlist Spotify scannable code.

## [1.0.0] - 2026-02-10
### Added
- Initial stable release of Spotify Flipbook.
- Input editor with line-based validation for Spotify URLs and custom messages.
- Printable preview/cards workflow with Spotify scannable code generation.
- Track metadata resolution with Spotify Web API support and oEmbed fallback.
- Improved issue handling for invalid input, resolution failures, and degraded metadata fallback.
