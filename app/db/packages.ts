import fs from 'fs';
import * as path from 'path';

export const libraries = {
  children: path.join(process.cwd(), 'app', 'db', 'libraries', 'children'),
  standard: path.join(process.cwd(), 'app', 'db', 'libraries', 'standard'),
  excluded: path.join(process.cwd(), 'app', 'db', 'libraries', 'excluded'),
  admin: path.join(process.cwd(), 'app', 'db', 'libraries', 'admin')
};

export const basePolicies = {
  HasPassword: true,
  HasConfiguredPassword: true,
  IsAdministrator: false,
  IsHidden: true,
  EnableCollectionManagement: false,
  EnableSubtitleManagement: false,
  EnableLyricManagement: false,
  AllowedTags: [],
  EnableUserPreferenceAccess: true,
  AccessSchedules: [],
  BlockUnratedItems: [],
  EnableRemoteControlOfOtherUsers: false,
  EnableSharedDeviceControl: true,
  EnableRemoteAccess: true,
  EnableLiveTvManagement: false,
  EnableLiveTvAccess: false,
  EnableMediaPlayback: true,
  EnableAudioPlaybackTranscoding: true,
  EnableVideoPlaybackTranscoding: true,
  EnablePlaybackRemuxing: true,
  ForceRemoteSourceTranscoding: false,
  EnableContentDeletion: false,
  EnableContentDeletionFromFolders: [],
  EnableSyncTranscoding: true,
  EnableMediaConversion: true,
  EnabledDevices: [],
  EnableAllDevices: true,
  EnabledChannels: [],
  EnableAllChannels: true,
  EnableAllFolders: false,
  InvalidLoginAttemptCount: 0,
  LoginAttemptsBeforeLockout: 3,
  EnablePublicSharing: true,
  BlockedMediaFolders: null,
  BlockedChannels: null,
  RemoteClientBitrateLimit: 5000000,
  AuthenticationProviderId: 'Jellyfin.Server.Implementations.Users.DefaultAuthenticationProvider',
  PasswordResetProviderId: 'Jellyfin.Server.Implementations.Users.DefaultPasswordResetProvider'
};

export const getLibraries = (librariesPath: string) => {
  // First get all admin libraries
  const adminLibraries = fs
    .readFileSync(libraries.admin, 'utf-8')
    .split('\n')
    .map((line) => line.split('->')[0])
    .filter((tag) => tag !== '');

  // Then get libraries from the requested path and filter out admin ones
  const list = fs
    .readFileSync(librariesPath, 'utf-8')
    .split('\n')
    .map((line) => line.split('->')[0])
    .filter((tag) => tag !== '' && !adminLibraries.includes(tag));

  return list;
};

const getBlockedTags = () => {
  const file = path.join(process.cwd(), 'app', 'db', 'blocked-tags');

  if (!fs.existsSync(file)) return ['mature'];

  const tags = fs
    .readFileSync(file, 'utf-8')
    .split('\n')
    .filter((tag) => tag !== '');

  return tags;
};

export const PACKAGES = {
  STANDARD: {
    ...basePolicies,
    IsDisabled: false,
    MaxActiveSessions: 2,
    SyncPlayAccess: 'None',
    EnableContentDownloading: false,
    BlockedTags: [],
    EnabledFolders: getLibraries(libraries.standard)
  },
  CHILDREN: {
    ...basePolicies,
    IsDisabled: false,
    BlockedTags: getBlockedTags(),
    MaxParentalRating: 13,
    EnabledFolders: getLibraries(libraries.children),
    MaxActiveSessions: 2,
    EnableContentDownloading: false,
    SyncPlayAccess: 'None'
  },
  PREMIUM: {
    ...basePolicies,
    IsDisabled: false,
    MaxActiveSessions: 2,
    EnableContentDownloading: true,
    SyncPlayAccess: 'CreateAndJoinGroups',
    BlockedTags: [],
    EnabledFolders: getLibraries(libraries.standard)
  },
  ADMIN: {
    ...basePolicies,
    IsDisabled: false,
    EnableContentDownloading: true,
    SyncPlayAccess: 'CreateAndJoinGroups',
    BlockedTags: [],
    EnabledFolders: getLibraries(libraries.standard)
  }
};

export type PackageName = keyof typeof PACKAGES;
