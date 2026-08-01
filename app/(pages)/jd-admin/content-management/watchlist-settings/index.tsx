'use client';

import { toast } from '@/components/breeze-ui/toast/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import useQueryHandler from '@/hooks/useQueryHandler';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import SetupWizard from './setup-wizard';

type WatchlistSettingsResponse = {
  settings: { moviesPlaylistName: string; playlistsViewName: string };
  moviesImageUrl: string | null;
  playlistsImageUrl: string | null;
};

type SetupStatusResponse = {
  pluginInstalled: boolean;
  hooks: { favorite: boolean; taskCompleted: boolean };
  serverUrl: string;
};

export default function WatchlistSettings() {
  const queryClient = useQueryClient();
  const [moviesPlaylistName, setMoviesPlaylistName] = useState('');
  const [playlistsViewName, setPlaylistsViewName] = useState('');
  const [moviesImage, setMoviesImage] = useState<File | null>(null);
  const [playlistsImage, setPlaylistsImage] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastFailures, setLastFailures] = useState<Array<{ playlistId: string; error: string }>>(
    []
  );
  const [showWizard, setShowWizard] = useState<boolean | null>(null);

  const { data, isError, error, isPending } = useQueryHandler<WatchlistSettingsResponse>({
    queryKey: 'watchlist-settings',
    endpoint: 'watchlist-settings'
  });

  const { data: setupStatus, isPending: isSetupStatusPending } =
    useQueryHandler<SetupStatusResponse>({
      queryKey: 'watchlist-setup-status',
      endpoint: 'watchlist-settings/setup/status'
    });

  useEffect(() => {
    if (setupStatus && showWizard === null) {
      const fullyConfigured =
        setupStatus.pluginInstalled && setupStatus.hooks.favorite && setupStatus.hooks.taskCompleted;
      setShowWizard(!fullyConfigured);
    }
  }, [setupStatus, showWizard]);

  useEffect(() => {
    if (data) {
      setMoviesPlaylistName(data.settings.moviesPlaylistName);
      setPlaylistsViewName(data.settings.playlistsViewName);
    }
  }, [data]);

  const handleSave = async () => {
    setIsSaving(true);

    try {
      const formData = new FormData();
      formData.append('moviesPlaylistName', moviesPlaylistName);
      formData.append('playlistsViewName', playlistsViewName);
      if (moviesImage) formData.append('moviesImage', moviesImage);
      if (playlistsImage) formData.append('playlistsImage', playlistsImage);

      const res = await fetch('/api/watchlist-settings', { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Failed to save watchlist settings');

      const result: WatchlistSettingsResponse & {
        applyResult: { fixed: number; failed: Array<{ playlistId: string; error: string }> };
      } = await res.json();

      setMoviesImage(null);
      setPlaylistsImage(null);
      queryClient.setQueryData(['watchlist-settings'], result);
      setLastFailures(result.applyResult.failed);

      const failedCount = result.applyResult.failed.length;
      toast({
        title: 'Watchlist settings saved',
        description:
          failedCount > 0
            ? `Applied to ${result.applyResult.fixed} playlist(s), ${failedCount} failed - see details below.`
            : `Applied to ${result.applyResult.fixed} playlist(s) right away.`,
        variant: failedCount > 0 ? 'destructive' : 'success',
        duration: 5000
      });
    } catch (err: any) {
      toast({
        title: 'Failed to save',
        description: err?.message ?? 'Could not save watchlist settings',
        variant: 'destructive',
        duration: 4000
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isError) {
    console.error(error);
    return <div>Error loading watchlist settings: {error.message}</div>;
  }

  if (showWizard || (showWizard === null && isSetupStatusPending)) {
    if (isSetupStatusPending || !setupStatus) {
      return (
        <Card className="flex items-center gap-2 w-full p-10 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading...
        </Card>
      );
    }

    return (
      <SetupWizard
        initialServerUrl={setupStatus.serverUrl}
        pluginAlreadyInstalled={setupStatus.pluginInstalled}
        onComplete={() => {
          setShowWizard(false);
          queryClient.invalidateQueries({ queryKey: ['watchlist-setup-status'] });
        }}
      />
    );
  }

  return (
    <Card className="flex flex-col w-full gap-8 p-10">
      <CardHeader className="p-0 flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>Watchlist Settings</CardTitle>
          <CardDescription>
            Controls the auto-generated Watchlist playlist and the &quot;Playlists&quot;
            home-screen tile every user gets. Saving applies immediately to every existing playlist
            and view, not just future ones - and the same values get re-applied automatically after
            every library scan, since Jellyfin otherwise resets these on its own.
          </CardDescription>
        </div>
        <button
          type="button"
          className="text-xs text-muted-foreground underline whitespace-nowrap"
          onClick={() => setShowWizard(true)}
        >
          Run setup again
        </button>
      </CardHeader>

      {isPending ? (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading...
        </div>
      ) : (
        <div className="flex flex-col gap-8 max-w-md">
          <div className="flex flex-col gap-4 border rounded-lg p-4">
            <div className="font-medium">&quot;Playlists&quot; tile</div>

            <Label htmlFor="playlistsViewName" className="flex flex-col gap-1">
              Name
              <Input
                id="playlistsViewName"
                value={playlistsViewName}
                onChange={(e) => setPlaylistsViewName(e.target.value)}
                disabled={isSaving}
              />
            </Label>

            <Label htmlFor="playlistsImage" className="flex flex-col gap-1">
              Thumbnail (also used as the primary image)
              <Input
                id="playlistsImage"
                type="file"
                accept="image/png,image/jpeg"
                onChange={(e) => setPlaylistsImage(e.target.files?.[0] ?? null)}
                disabled={isSaving}
              />
            </Label>

            {data?.playlistsImageUrl && (
              <div className="flex items-center justify-center h-40 w-full rounded-md border bg-muted/40 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={data.playlistsImageUrl}
                  alt="Current Playlists tile image"
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4 border rounded-lg p-4">
            <div className="font-medium">Movies / Documentaries Watchlist</div>

            <Label htmlFor="moviesPlaylistName" className="flex flex-col gap-1">
              Name
              <Input
                id="moviesPlaylistName"
                value={moviesPlaylistName}
                onChange={(e) => setMoviesPlaylistName(e.target.value)}
                disabled={isSaving}
              />
            </Label>

            <Label htmlFor="moviesImage" className="flex flex-col gap-1">
              Primary image
              <Input
                id="moviesImage"
                type="file"
                accept="image/png,image/jpeg"
                onChange={(e) => setMoviesImage(e.target.files?.[0] ?? null)}
                disabled={isSaving}
              />
            </Label>

            {data?.moviesImageUrl && (
              <div className="flex items-center justify-center h-40 w-full rounded-md border bg-muted/40 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={data.moviesImageUrl}
                  alt="Current watchlist playlist image"
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            )}
          </div>

          <Button
            onClick={handleSave}
            disabled={isSaving || !moviesPlaylistName.trim() || !playlistsViewName.trim()}
            className="self-start"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            {isSaving ? 'Saving...' : 'Save & Apply Now'}
          </Button>

          {lastFailures.length > 0 && (
            <div className="flex flex-col gap-2 border border-destructive/50 bg-destructive/5 rounded-lg p-4 text-sm">
              <div className="font-medium text-destructive">
                {lastFailures.length} playlist{lastFailures.length > 1 ? 's' : ''} failed to update
              </div>
              <ul className="flex flex-col gap-1">
                {lastFailures.map((failure) => (
                  <li key={failure.playlistId} className="text-muted-foreground">
                    <span className="font-mono text-xs">{failure.playlistId}</span> —{' '}
                    {failure.error}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
