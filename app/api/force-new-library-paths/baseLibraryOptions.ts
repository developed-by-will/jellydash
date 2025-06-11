import { LibraryConfig } from './types';

export const baseLibraryConfig: LibraryConfig = {
  LibraryOptions: {
    Enabled: true,
    EnableArchiveMediaFiles: false,
    EnablePhotos: true,
    EnableRealtimeMonitor: true,
    EnableLUFSScan: true,
    ExtractTrickplayImagesDuringLibraryScan: false,
    SaveTrickplayWithMedia: false,
    EnableTrickplayImageExtraction: false,
    ExtractChapterImagesDuringLibraryScan: false,
    EnableChapterImageExtraction: false,
    EnableInternetProviders: true,
    SaveLocalMetadata: true,
    EnableAutomaticSeriesGrouping: false,
    SeasonZeroDisplayName: 'Specials',
    AutomaticRefreshIntervalDays: 0,
    EnableEmbeddedTitles: false,
    EnableEmbeddedExtrasTitles: false,
    EnableEmbeddedEpisodeInfos: false,
    SkipSubtitlesIfEmbeddedSubtitlesPresent: false,
    SkipSubtitlesIfAudioTrackMatches: false,
    SaveSubtitlesWithMedia: true,
    SaveLyricsWithMedia: false,
    RequirePerfectSubtitleMatch: true,
    AutomaticallyAddToCollection: false,
    PreferNonstandardArtistsTag: false,
    UseCustomTagDelimiters: false,
    MetadataSavers: ['Nfo'],
    TypeOptions: [
      {
        Type: 'Series',
        MetadataFetchers: ['TheMovieDb', 'The Open Movie Database', 'TVmaze'],
        MetadataFetcherOrder: [
          'AniSearch',
          'AniList',
          'AniDB',
          'TheMovieDb',
          'The Open Movie Database',
          'TVmaze'
        ],
        ImageFetchers: ['Fanart', 'TheMovieDb', 'TVmaze'],
        ImageFetcherOrder: ['Fanart', 'TheMovieDb', 'AniDB', 'AniList', 'AniSearch', 'TVmaze']
      },
      {
        Type: 'Season',
        MetadataFetchers: ['TVmaze', 'TheMovieDb'],
        MetadataFetcherOrder: ['AniDB', 'TVmaze', 'TheMovieDb'],
        ImageFetchers: ['Fanart', 'TheMovieDb', 'TVmaze'],
        ImageFetcherOrder: ['Fanart', 'TheMovieDb', 'AniDB', 'AniList', 'AniSearch', 'TVmaze']
      },
      {
        Type: 'Episode',
        MetadataFetchers: ['TheMovieDb', 'The Open Movie Database', 'TVmaze'],
        MetadataFetcherOrder: ['TheMovieDb', 'The Open Movie Database', 'AniDB', 'TVmaze'],
        ImageFetchers: [
          'TheMovieDb',
          'TVmaze',
          'The Open Movie Database',
          'Embedded Image Extractor',
          'Screen Grabber'
        ],
        ImageFetcherOrder: [
          'TheMovieDb',
          'TVmaze',
          'The Open Movie Database',
          'Embedded Image Extractor',
          'Screen Grabber'
        ]
      },
      {
        Type: 'Movie',
        MetadataFetchers: ['TheMovieDb', 'The Open Movie Database'],
        MetadataFetcherOrder: ['AniList', 'TheMovieDb', 'The Open Movie Database', 'AniDB'],
        ImageFetchers: [
          'TheMovieDb',
          'Fanart',
          'The Open Movie Database',
          'Embedded Image Extractor',
          'Screen Grabber'
        ],
        ImageFetcherOrder: [
          'TheMovieDb',
          'Fanart',
          'AniDB',
          'AniList',
          'The Open Movie Database',
          'Embedded Image Extractor',
          'Screen Grabber'
        ]
      }
    ],
    LocalMetadataReaderOrder: ['Nfo'],
    SubtitleDownloadLanguages: [],
    CustomTagDelimiters: ['/', '|', ';', '\\'],
    DelimiterWhitelist: [],
    DisabledSubtitleFetchers: [],
    SubtitleFetcherOrder: [],
    DisabledLyricFetchers: [],
    LyricFetcherOrder: []
  }
};
