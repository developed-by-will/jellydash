const bgSuccess = 'bg-emerald-600 hover:bg-emerald-700 text-sm';
const bgDestructive = 'bg-red-600 hover:bg-red-700 focus:bg-red-700 focus:text-white text-white';
const bgDisabled = 'bg-gray-600 text-white';

// Jellyfin's synthetic "Playlists" home screen view - not a real library, so it never shows up
// in /Library/VirtualFolders and has no entry in db/libraries/*. Shared between user creation
// (which seeds a default OrderedViews) and the reorder-home page (which lets admins move it).
const PLAYLISTS_VIEW_ID = '4b94e5cbf58c7a5ea5a2c7bbd0a1e781';
const PLAYLISTS_VIEW_NAME = 'Playlists';

// /api/users/update-configs applies one SubtitleLanguagePreference to every user on the server
// (it's a bulk overwrite, not per-user) - this deployment's libraries are Portuguese, so this is
// what user creation has always sent. Shared so the reorder-home page's "push to everyone" save
// doesn't quietly reset it to the route's own 'eng' fallback.
const DEFAULT_SUBTITLE_LANGUAGE = 'por';

export {
  bgDestructive,
  bgDisabled,
  bgSuccess,
  DEFAULT_SUBTITLE_LANGUAGE,
  PLAYLISTS_VIEW_ID,
  PLAYLISTS_VIEW_NAME
};
