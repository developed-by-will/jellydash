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
};

type DeleteConfig = {
  method: 'DELETE';
  body?: any;
  requiresAuth?: boolean;
};

type JellyfinItem = {
  Name: string;
  Id: string;
  ServerId: string;
  PremiereDate: string;
  Type: string;
};

export type JellyfinResponse = {
  Items: JellyfinItem[];
};

export type CustomPreferences = {
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

export type Library = {
  id: string;
  name: string;
};

export type LibraryItem = {
  ItemId: string;
  Name: string;
};

export type ApiConfig = GetConfig | PostConfig | DeleteConfig;
