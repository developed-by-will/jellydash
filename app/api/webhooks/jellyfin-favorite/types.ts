export interface UserDataSavedPayload {
  NotificationType?: string;
  SaveReason: string;
  ItemId: string;
  ItemType: string;
  Name: string;
  UserId: string;
  NotificationUsername?: string;
  Favorite: boolean;
  SeriesId?: string;
  SeriesName?: string;
}

export type FavoriteChange = {
  userId: string;
  itemId: string;
  itemType: string;
  favorite: boolean;
  seriesId?: string;
  seriesName?: string;
};

export type WatchlistUserEntry = {
  moviesPlaylistId?: string;
  series: Record<string, string>;
};

export type WatchlistStore = Record<string, WatchlistUserEntry>;

export type PlaylistCreationResult = {
  Id: string;
};
