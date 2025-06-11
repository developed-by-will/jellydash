type LibraryOptions = {
  Enabled: boolean;
  EnableArchiveMediaFiles: boolean;
  EnablePhotos: boolean;
  EnableRealtimeMonitor: boolean;
  EnableLUFSScan: boolean;
  ExtractTrickplayImagesDuringLibraryScan: boolean;
  SaveTrickplayWithMedia: boolean;
  EnableTrickplayImageExtraction: boolean;
  ExtractChapterImagesDuringLibraryScan: boolean;
  EnableChapterImageExtraction: boolean;
  EnableInternetProviders: boolean;
  SaveLocalMetadata: boolean;
  EnableAutomaticSeriesGrouping: boolean;
  SeasonZeroDisplayName: string;
  AutomaticRefreshIntervalDays: number;
  EnableEmbeddedTitles: boolean;
  EnableEmbeddedExtrasTitles: boolean;
  EnableEmbeddedEpisodeInfos: boolean;
  SkipSubtitlesIfEmbeddedSubtitlesPresent: boolean;
  SkipSubtitlesIfAudioTrackMatches: boolean;
  SaveSubtitlesWithMedia: boolean;
  SaveLyricsWithMedia: boolean;
  RequirePerfectSubtitleMatch: boolean;
  AutomaticallyAddToCollection: boolean;
  PreferNonstandardArtistsTag: boolean;
  UseCustomTagDelimiters: boolean;
  MetadataSavers: string[];
  TypeOptions: {
    Type: string;
    MetadataFetchers: string[];
    MetadataFetcherOrder: string[];
    ImageFetchers: string[];
    ImageFetcherOrder: string[];
  }[];
  LocalMetadataReaderOrder: string[];
  SubtitleDownloadLanguages: string[];
  CustomTagDelimiters: string[];
  DelimiterWhitelist: string[];
  DisabledSubtitleFetchers: string[];
  SubtitleFetcherOrder: string[];
  DisabledLyricFetchers: string[];
  LyricFetcherOrder: string[];
  PathInfos?: {
    Path: string;
  }[];
};

export type LibraryConfig = {
  LibraryOptions: LibraryOptions;
};

export const allowedSubtitleValues = ['AllowAll', 'AllowText', 'AllowImage', 'AllowNone'];
