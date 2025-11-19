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

type JellyfinItem = {
  Name: string;
  Id: string;
  ServerId: string;
  PremiereDate: string;
  Type: string;
  MediaSources?: JellyfinMediaSource[];
  MediaStreams?: JellyfinMediaStream[];
  OfficialRating?: string;
  ImageTags?: {
    Primary: string;
  };
  ImageBlurHashes: {
    Primary: {
      [key: string]: string;
    };
  };
};

export type JellyfinResponse = {
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
