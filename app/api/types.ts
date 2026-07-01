export type User = {
  Name: string;
  ServerId: string;
  Id: string;
  HasPassword: boolean;
  HasConfiguredPassword: boolean;
  HasConfiguredEasyPassword: boolean;
  EnableAutoLogin: boolean;
  LastLoginDate: string;
  LastActivityDate: string;
  Configuration: {
    PlayDefaultAudioTrack: boolean;
    SubtitleLanguagePreference: string;
    DisplayMissingEpisodes: boolean;
    GroupedFolders: string[];
    SubtitleMode: string;
    DisplayCollectionsView: boolean;
    EnableLocalPassword: boolean;
    OrderedViews: string[];
    LatestItemsExcludes: string[];
    MyMediaExcludes: string[];
    HidePlayedInLatest: boolean;
    RememberAudioSelections: boolean;
    RememberSubtitleSelections: boolean;
    EnableNextEpisodeAutoPlay: boolean;
    CastReceiverId: string;
  };
  Policy: {
    IsAdministrator: boolean;
    IsHidden: boolean;
    MaxParentalRating: number;
    EnableCollectionManagement: boolean;
    EnableSubtitleManagement: boolean;
    EnableLyricManagement: boolean;
    IsDisabled: boolean;
    BlockedTags: string[];
    AllowedTags: string[];
    EnableUserPreferenceAccess: boolean;
    AccessSchedules: string[];
    BlockUnratedItems: string[];
    EnableRemoteControlOfOtherUsers: boolean;
    EnableSharedDeviceControl: boolean;
    EnableRemoteAccess: boolean;
    EnableLiveTvManagement: boolean;
    EnableLiveTvAccess: boolean;
    EnableMediaPlayback: boolean;
    EnableAudioPlaybackTranscoding: boolean;
    EnableVideoPlaybackTranscoding: boolean;
    EnablePlaybackRemuxing: boolean;
    ForceRemoteSourceTranscoding: boolean;
    EnableContentDeletion: boolean;
    EnableContentDeletionFromFolders: string[];
    EnableContentDownloading: boolean;
    EnableSyncTranscoding: boolean;
    EnableMediaConversion: boolean;
    EnabledDevices: string[];
    EnableAllDevices: boolean;
    EnabledChannels: string[];
    EnableAllChannels: boolean;
    EnabledFolders: string[];
    EnableAllFolders: boolean;
    InvalidLoginAttemptCount: number;
    LoginAttemptsBeforeLockout: number;
    MaxActiveSessions: number;
    EnablePublicSharing: boolean;
    BlockedMediaFolders: string[];
    BlockedChannels: string[];
    RemoteClientBitrateLimit: number;
    AuthenticationProviderId: string;
    PasswordResetProviderId: string;
    SyncPlayAccess: string;
  };
};

type GetConfig = {
  method: 'GET';
  requiresAuth?: boolean;
};

type PostConfig = {
  method: 'POST';
  body: any;
  requiresAuth?: boolean;
  accessToken?: string;
};

type DeleteConfig = {
  method: 'DELETE';
  body?: any;
  requiresAuth?: boolean;
};

export type JellyfinMediaStream = {
  Codec: string;
  Type: 'Video' | 'Audio' | 'Subtitle';
  Width: number;
  Height: number;
};

export type JellyfinMediaSource = {
  Container: string;
  MediaStreams?: JellyfinMediaStream[];
  Path: string;
};

export type JellyfinItem = {
  Name: string;
  Id: string;
  PremiereDate?: string;
  Type?: string;
  MediaSources?: JellyfinMediaSource[];
  MediaStreams?: JellyfinMediaStream[];
  OfficialRating?: string;
  DateCreated?: string;
  ImageTags?: {
    Primary: string;
  };
  ImageBlurHashes?: {
    Primary: {
      [key: string]: string;
    };
  };
};

export type JellyfinItemsResponse = {
  Items: JellyfinItem[];
  TotalRecordCount: number;
  StartIndex?: number;
};

export type CustomPreferencesBase = {
  SortBy: string;
  RememberSorting: boolean;
  RememberIndexing: boolean;
  SortOrder: string;
  Client: string;
  PrimaryImageHeight: number;
  PrimaryImageWidth: number;
  CustomPrefs: {
    homesection0?: string;
    homesection1?: string;
    homesection2?: string;
    homesection3?: string;
    homesection4?: string;
    homesection5?: string;
    homesection6?: string;
    homesection7?: string;
    homesection8?: string;
    homesection9?: string;
    homesection10?: string;
    chromecastVersion: string;
    skipForwardLength: string;
    skipBackLength: string;
    enableNextVideoInfoOverlay: string;
    tvhome: string | null;
    dashboardTheme: string | null;
  };
  ScrollDirection: string;
  ShowBackdrop: boolean;
  ShowSidebar: boolean;
};

export type CustomPreferencesAndroidTV = CustomPreferencesBase & {
  Id?: string;
  CustomPrefs: {
    FilterFavoritesOnly?: string | null;
    FilterUnwatchedOnly?: string | null;
    SortBy: string;
    SortOrder: string;
    GridDirection: string;
    PosterSize: string;
    SmartScreen: string;
  };
};

export type Library = {
  id: string;
  name: string;
};

export type LibraryItem = {
  ItemId: string;
  Name: string;
};

export type ApiConfig = GetConfig | PostConfig | DeleteConfig;

export type CreateUserResponseType = {
  User: User;
  Pw?: string;
};

export type UsersUpdateConfigsPayloadType = {
  OrderedViews: string[];
  SubtitleLanguagePreference: string;
};

export type UpdateDisplayPrefsPayloadType = {
  SortBy: string;
  CustomPrefs: {
    homesection0: string;
    homesection1: string;
    homesection2: string;
    homesection3: string;
    homesection4: string;
    homesection5: string;
    homesection6: string;
    homesection7: string;
    homesection8: string;
    homesection9: string;
    homesection10: string;
  };
  ScrollDirection: string;
};

type RemoteImageType = {
  Url: string;
  Height: number;
  Width: number;
};

export type RemoteImagesType = {
  Images: RemoteImageType[];
};

export type SearchItemType = {
  Id: string;
  Name: string;
  OriginalTitle: string;
  OfficialRating: string;
  Overview?: string;
  ImageTags: {
    Primary: string;
  };
  ImageBlurHashes: {
    Primary: {
      [key: string]: string;
    };
  };
};

export type SearchItemsType = {
  Items: SearchItemType[];
};

export type PosterType = SearchItemType & {
  Src: string;
};

type ConversionState = {
  ffmpeg: any;
  tempOutputPath: string;
  percent: number;
  startTime: number;
};

export const runningConversions = new Map<string, ConversionState>();

export type VirtualFolderType = {
  Name: string;
  Locations: string[];
  ItemId: string;
  LibraryOptions: {
    Enabled: boolean;
    TypeOptions: {
      Type: 'Series' | 'Movie';
    }[];
  };
};

export type M3UResponseType = {
  Id: string;
  Url: string;
  Type: string;
  ImportFavoritesOnly: boolean;
  AllowHWTranscoding: boolean;
  AllowFmp4TranscodingContainer: boolean;
  AllowStreamSharing: boolean;
  FallbackMaxStreamingBitrate: number;
  EnableStreamLooping: boolean;
  TunerCount: number;
  IgnoreDts: boolean;
  ReadAtNativeFramerate: boolean;
};

export type M3UListReponseType = {
  Items: [
    {
      Name: string;
      ServerId: string;
      Id: string;
      ChannelId: null;
      Number: string;
      ChannelNumber: string;
      IsFolder: boolean;
      Type: string;
      UserData: {
        PlaybackPositionTicks: number;
        PlayCount: number;
        IsFavorite: boolean;
        Played: boolean;
        Key: string;
        ItemId: string;
      };
      ImageTags: {
        Primary: string;
      };
      BackdropImageTags: [];
      ImageBlurHashes: object;
      LocationType: string;
      MediaType: string;
      ChannelType: string;
    }
  ];
};

export type ChannelPayloadType = {
  Id: string;
  Name: string;
  OriginalTitle: string;
  ForcedSortName: string;
  CommunityRating: string;
  CriticRating: string;
  IndexNumber: number | null;
  AirsBeforeSeasonNumber: string;
  AirsAfterSeasonNumber: string;
  AirsBeforeEpisodeNumber: string;
  ParentIndexNumber: number | null;
  DisplayOrder: string;
  Album: string;
  AlbumArtists: string[];
  ArtistItems: unknown[];
  Overview: string;
  Status: string;
  AirDays: string[];
  AirTime: string;
  Genres: string[];
  Tags: string[];
  Studios: string[];
  PremiereDate: string | null;
  DateCreated: string;
  EndDate: string | null;
  ProductionYear: string;
  Height: string;
  AspectRatio: string;
  Video3DFormat: string;
  OfficialRating: string;
  CustomRating: string;
  People: unknown[];
  LockData: boolean;
  LockedFields: string[];
  ProviderIds: {
    ExternalServiceId: string;
    [key: string]: string;
  };
  PreferredMetadataLanguage: string;
  PreferredMetadataCountryCode: string;
  Taglines: string[];
};

export type ChannelResponseType = {
  Id: string;
  Name: string;
  ServerId: string;
  Etag: string;
  DateCreated: string;
  CanDelete: boolean;
  CanDownload: boolean;
  PreferredMetadataLanguage: string;
  PreferredMetadataCountryCode: string;
  SortName: string;
  ForcedSortName: string;
  ExternalUrls: unknown[];
  MediaSources: {
    Protocol: string;
    Id: string;
    Type: string;
    Name: string;
    IsRemote: boolean;
    ReadAtNativeFramerate: boolean;
    IgnoreDts: boolean;
    IgnoreIndex: boolean;
    GenPtsInput: boolean;
    SupportsTranscoding: boolean;
    SupportsDirectStream: boolean;
    SupportsDirectPlay: boolean;
    IsInfiniteStream: boolean;
    UseMostCompatibleTranscodingProfile: boolean;
    RequiresOpening: boolean;
    RequiresClosing: boolean;
    RequiresLooping: boolean;
    SupportsProbing: boolean;
    MediaStreams: unknown[];
    MediaAttachments: unknown[];
    Formats: unknown[];
    RequiredHttpHeaders: Record<string, string>;
    TranscodingSubProtocol: string;
    HasSegments: boolean;
  }[];
  EnableMediaSourceDisplay: boolean;
  CustomRating: string;
  ChannelId: string | null;
  Overview: string;
  Taglines: string[];
  Genres: string[];
  PlayAccess: string;
  Number: string;
  ChannelNumber: string;
  RemoteTrailers: unknown[];
  ProviderIds: {
    ExternalServiceId: string;
    [key: string]: string;
  };
  IsFolder: boolean;
  ParentId: string;
  Type: string;
  People: unknown[];
  Studios: unknown[];
  GenreItems: unknown[];
  LocalTrailerCount: number;
  UserData: {
    PlaybackPositionTicks: number;
    PlayCount: number;
    IsFavorite: boolean;
    Played: boolean;
    Key: string;
    ItemId: string;
  };
  SpecialFeatureCount: number;
  DisplayPreferencesId: string;
  Tags: string[];
  PrimaryImageAspectRatio: number;
  MediaStreams: unknown[];
  ImageTags: {
    Primary: string;
    [key: string]: string;
  };
  BackdropImageTags: string[];
  ImageBlurHashes: Record<string, string>;
  LocationType: string;
  MediaType: string;
  LockedFields: string[];
  LockData: boolean;
  ChannelType: string;
};

export type M3UList = {
  Id: string;
  AssignedUsername: string;
};
