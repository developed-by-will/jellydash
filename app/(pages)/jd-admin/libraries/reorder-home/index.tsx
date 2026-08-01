'use client';

import { BASE_URL } from '@/app/api/constants';
import { LibraryWithRoles } from '@/app/api/libraries/roles/route';
import { Library, UsersUpdateConfigsPayloadType } from '@/app/api/types';
import { DEFAULT_SUBTITLE_LANGUAGE, PLAYLISTS_VIEW_ID, PLAYLISTS_VIEW_NAME } from '@/app/constants';
import { toast } from '@/components/breeze-ui/toast/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useMutationHandler } from '@/hooks/useMutationHandler';
import useQueryHandler from '@/hooks/useQueryHandler';
import { Loader2, RefreshCw, Save } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import Tile, { OrderableTile } from './components/tile';

type WatchlistSettingsResponse = {
  settings: {
    moviesPlaylistName: string;
    playlistsViewName: string;
  };
  playlistsImageUrl: string | null;
};

// Same "fillHeight/fillWidth" pattern the rest of the admin panel uses to size Jellyfin item
// images (e.g. parental-ratings' poster grid) - landscape here since library tiles are.
function libraryImageUrl(id: string): string {
  return `${BASE_URL}/Items/${id}/Images/Primary?fillHeight=140&fillWidth=240&quality=90`;
}

type UpdateConfigsResponse = {
  message: string;
  details: {
    totalUsers: number;
    successfulUpdates: number;
    failedUpdates: number;
    failedUsers: { userId: string; username: string; error?: string }[];
  };
};

export default function ReorderHome() {
  const {
    data: libraries,
    isPending: librariesPending,
    isFetching: librariesFetching,
    isError: librariesError,
    error: librariesErrorObj,
    refetch: refetchLibraries
  } = useQueryHandler<LibraryWithRoles[]>({
    queryKey: 'libraries-roles',
    endpoint: 'libraries/roles'
  });

  const {
    data: savedOrder,
    isPending: savedOrderPending,
    refetch: refetchSavedOrder
  } = useQueryHandler<Library[]>({
    queryKey: 'ordered-views',
    endpoint: 'ordered-views'
  });

  // The tile's on-screen label comes from here (set on the Watchlist Settings page), not from
  // anything in OrderedViews - Jellyfin only uses OrderedViews entries for ordering, never for
  // display names. Falls back to the raw "Playlists" name only until this loads.
  const { data: watchlistSettings } = useQueryHandler<WatchlistSettingsResponse>({
    queryKey: 'watchlist-settings',
    endpoint: 'watchlist-settings'
  });

  const playlistsTile: OrderableTile = {
    id: PLAYLISTS_VIEW_ID,
    name: watchlistSettings?.settings.playlistsViewName || PLAYLISTS_VIEW_NAME,
    isPlaylists: true,
    imageUrl: watchlistSettings?.playlistsImageUrl
  };

  const { mutateAsync: saveOrderedViews, isPending: isSaving } = useMutationHandler<
    { orderedViews: OrderableTile[] },
    { ok: boolean }
  >({
    endpoint: 'ordered-views',
    method: 'POST',
    mutationKey: 'save-ordered-views'
  });

  // Same endpoint users/create uses to seed a new user's home screen order - it applies the given
  // OrderedViews (and SubtitleLanguagePreference) to every user on the server in one go, which is
  // the only way an order change here actually reaches anyone's home screen.
  const { mutateAsync: applyOrderToUsers, isPending: isApplying } = useMutationHandler<
    UsersUpdateConfigsPayloadType,
    UpdateConfigsResponse
  >({
    endpoint: 'users/update-configs',
    method: 'POST',
    mutationKey: 'reorder-home-apply-to-users'
  });

  const { mutateAsync: addToExcluded } = useMutationHandler({
    endpoint: 'libraries/membership',
    method: 'POST',
    mutationKey: 'reorder-home-exclude-add',
    invalidateQueryKeys: ['libraries-roles']
  });

  const { mutateAsync: removeFromExcluded } = useMutationHandler({
    endpoint: 'libraries/membership',
    method: 'DELETE',
    mutationKey: 'reorder-home-exclude-remove',
    invalidateQueryKeys: ['libraries-roles']
  });

  const [order, setOrder] = useState<OrderableTile[]>([]);
  const [excluded, setExcluded] = useState<OrderableTile[]>([]);
  const [baselineIds, setBaselineIds] = useState<string[]>([]);
  const [initialized, setInitialized] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  const isPending = librariesPending || savedOrderPending;
  const dirty = useMemo(
    () => order.map((item) => item.id).join(',') !== baselineIds.join(','),
    [order, baselineIds]
  );

  // Reconciles the live Jellyfin library list (always fresh - libraries/roles hits Jellyfin on
  // every load) against the last-saved order. Playlists is pinned separately (see below) and
  // never part of this list. Only runs once per load so it doesn't clobber a reorder in progress
  // every time react-query silently revalidates in the background.
  useEffect(() => {
    if (initialized || !libraries || !savedOrder) return;

    const includedLibs: OrderableTile[] = libraries
      .filter((lib) => !lib.excluded)
      .map((lib) => ({ id: lib.id, name: lib.name, imageUrl: libraryImageUrl(lib.id) }));
    const excludedLibs: OrderableTile[] = libraries
      .filter((lib) => lib.excluded)
      .map((lib) => ({ id: lib.id, name: lib.name, imageUrl: libraryImageUrl(lib.id) }));

    const byId = new Map(includedLibs.map((item) => [item.id, item]));

    const knownSavedIds = savedOrder
      .map((view) => view.id)
      .filter((id) => id !== PLAYLISTS_VIEW_ID && byId.has(id));
    const newIds = includedLibs
      .map((item) => item.id)
      .filter((id) => !knownSavedIds.includes(id));

    setOrder([...knownSavedIds, ...newIds].map((id) => byId.get(id)!));
    setExcluded(excludedLibs);
    setBaselineIds(knownSavedIds);
    setInitialized(true);
  }, [libraries, savedOrder, initialized]);

  const handleRefresh = async () => {
    if (dirty) {
      const confirmed = window.confirm(
        'Refreshing pulls the latest library list from Jellyfin and discards any unsaved order changes. Continue?'
      );
      if (!confirmed) return;
    }

    setInitialized(false);
    await Promise.all([refetchLibraries(), refetchSavedOrder()]);
  };

  const handleToggleExclude = async (item: OrderableTile, isExcluded: boolean) => {
    setPendingId(item.id);

    try {
      if (isExcluded) {
        await removeFromExcluded({ id: item.id, list: 'EXCLUDED' });
        setExcluded((prev) => prev.filter((e) => e.id !== item.id));
        setOrder((prev) => [...prev, item]);
      } else {
        await addToExcluded({ id: item.id, name: item.name, list: 'EXCLUDED' });
        setOrder((prev) => prev.filter((o) => o.id !== item.id));
        setExcluded((prev) => [...prev, item]);
      }

      toast({
        title: isExcluded ? 'Restored to home screen' : 'Excluded from home screen',
        description: item.name,
        variant: 'success',
        duration: 3000
      });
    } catch (err: any) {
      toast({
        title: 'Failed to update library',
        description: err?.message ?? `Could not update ${item.name}`,
        variant: 'destructive',
        duration: 4000
      });
    } finally {
      setPendingId(null);
    }
  };

  const handleDragStart = (id: string) => () => setDragId(id);

  const handleDragOver = (id: string) => (e: React.DragEvent) => {
    e.preventDefault();
    if (id !== dragId) setOverId(id);
  };

  const handleDrop = (id: string) => (e: React.DragEvent) => {
    e.preventDefault();

    if (dragId && dragId !== id) {
      setOrder((prev) => {
        const fromIndex = prev.findIndex((item) => item.id === dragId);
        const toIndex = prev.findIndex((item) => item.id === id);
        if (fromIndex === -1 || toIndex === -1) return prev;

        const next = [...prev];
        const [moved] = next.splice(fromIndex, 1);
        next.splice(toIndex, 0, moved);
        return next;
      });
    }

    setDragId(null);
    setOverId(null);
  };

  const handleDragEnd = () => {
    setDragId(null);
    setOverId(null);
  };

  const handleSave = async () => {
    const fullOrder = [playlistsTile, ...order];

    try {
      await saveOrderedViews({ orderedViews: fullOrder });
      setBaselineIds(order.map((item) => item.id));
    } catch (err: any) {
      toast({
        title: 'Failed to save order',
        description: err?.message ?? 'Could not save the home screen order',
        variant: 'destructive',
        duration: 4000
      });
      return;
    }

    // The file is saved at this point regardless of what happens next, so a failure past here
    // shouldn't be reported as "failed to save" - the order isn't lost, it just hasn't reached
    // Jellyfin yet and Save can be retried.
    try {
      const result = await applyOrderToUsers({
        OrderedViews: fullOrder.map((item) => `${item.id}->${item.name}`),
        SubtitleLanguagePreference: DEFAULT_SUBTITLE_LANGUAGE
      });

      const { totalUsers, successfulUpdates, failedUpdates } = result.details;

      toast({
        title: failedUpdates > 0 ? 'Saved, applied with some failures' : 'Order saved',
        description:
          failedUpdates > 0
            ? `Applied to ${successfulUpdates} of ${totalUsers} user(s), ${failedUpdates} failed.`
            : `Applied to all ${totalUsers} user(s).`,
        variant: failedUpdates > 0 ? 'warning' : 'success',
        duration: 5000
      });
    } catch (err: any) {
      toast({
        title: 'Saved, but not applied yet',
        description:
          err?.message ??
          'The order was saved but could not be pushed to users. Try Save Order again.',
        variant: 'warning',
        duration: 6000
      });
    }
  };

  if (librariesError) {
    return <div>Error loading libraries: {librariesErrorObj?.message}</div>;
  }

  return (
    <div className="flex flex-col gap-5">
      <Card className="flex flex-col gap-6 p-10">
        <CardHeader className="p-0 flex-row items-center justify-between">
          <div>
            <CardTitle>Home Screen Order</CardTitle>
            <CardDescription>
              Drag library tiles to set the order of the &quot;My Media&quot; row on the home
              screen. The Playlists tile always leads and can&apos;t be moved - Jellyfin re-pins it
              first on its own. Excluded libraries are listed separately below and can&apos;t be
              reordered either.
            </CardDescription>
          </div>

          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={librariesFetching || isPending}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${librariesFetching ? 'animate-spin' : ''}`} />
            Refresh Libraries
          </Button>
        </CardHeader>

        {isPending ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-14 w-full" />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <Tile item={playlistsTile} excluded={false} pinned />

            {order.length === 0 && (
              <CardDescription>No other libraries to order - everything else is excluded.</CardDescription>
            )}

            {order.map((item) => (
              <Tile
                key={item.id}
                item={item}
                excluded={false}
                draggable
                isDragging={dragId === item.id}
                isDropTarget={overId === item.id}
                isPending={pendingId === item.id}
                onToggleExclude={() => handleToggleExclude(item, false)}
                onDragStart={handleDragStart(item.id)}
                onDragOver={handleDragOver(item.id)}
                onDrop={handleDrop(item.id)}
                onDragEnd={handleDragEnd}
              />
            ))}
          </div>
        )}

        <div className="flex items-center gap-3 self-end">
          {dirty && <span className="text-xs text-muted-foreground">Unsaved changes</span>}

          <Button onClick={handleSave} disabled={!dirty || isSaving || isApplying || isPending}>
            {isSaving || isApplying ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {isApplying ? 'Applying...' : 'Save Order'}
          </Button>
        </div>
      </Card>

      <Card className="flex flex-col gap-4 p-10">
        <CardHeader className="p-0">
          <CardTitle>Excluded from Home</CardTitle>
          <CardDescription>
            Hidden from every user&apos;s home screen. Click the eye to bring one back.
          </CardDescription>
        </CardHeader>

        <div className="flex flex-col gap-2">
          {!isPending && excluded.length === 0 && (
            <CardDescription>Nothing excluded.</CardDescription>
          )}

          {isPending
            ? Array.from({ length: 2 }).map((_, index) => (
                <Skeleton key={index} className="h-14 w-full" />
              ))
            : excluded.map((item) => (
                <Tile
                  key={item.id}
                  item={item}
                  excluded
                  isPending={pendingId === item.id}
                  onToggleExclude={() => handleToggleExclude(item, true)}
                />
              ))}
        </div>
      </Card>
    </div>
  );
}
