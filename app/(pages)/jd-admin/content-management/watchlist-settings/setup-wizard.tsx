'use client';

import { toast } from '@/components/breeze-ui/toast/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle2, Circle, Loader2, XCircle } from 'lucide-react';
import { useState } from 'react';

type SetupWizardProps = {
  initialServerUrl: string;
  pluginAlreadyInstalled: boolean;
  onComplete: () => void;
};

type Step = 1 | 2 | 3 | 4;

async function postJson<T>(endpoint: string, body?: unknown): Promise<T> {
  const res = await fetch(`/api/watchlist-settings/setup/${endpoint}`, {
    method: 'POST',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined
  });
  if (!res.ok) {
    throw new Error(`Request to ${endpoint} failed`);
  }
  return res.json();
}

function StatusIcon({ state }: { state: 'idle' | 'yes' | 'no' }) {
  if (state === 'yes') return <CheckCircle2 className="h-4 w-4 text-green-600" />;
  if (state === 'no') return <XCircle className="h-4 w-4 text-destructive" />;
  return <Circle className="h-4 w-4 text-muted-foreground" />;
}

export default function SetupWizard({
  initialServerUrl,
  pluginAlreadyInstalled,
  onComplete
}: SetupWizardProps) {
  const [step, setStep] = useState<Step>(pluginAlreadyInstalled ? 3 : 1);

  // Step 2
  const [apiBaseUrl, setApiBaseUrl] = useState(initialServerUrl);
  const [testPassed, setTestPassed] = useState(false);
  const [testing, setTesting] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [installed, setInstalled] = useState(pluginAlreadyInstalled);

  // Step 3
  const [restarting, setRestarting] = useState(false);
  const [checkingConnection, setCheckingConnection] = useState(false);
  const [hasRestarted, setHasRestarted] = useState(false);
  const [serverConfirmedUp, setServerConfirmedUp] = useState(false);

  // Step 4
  const [applyingHooks, setApplyingHooks] = useState(false);
  const [creatingWatchlists, setCreatingWatchlists] = useState(false);
  const [hooksStatus, setHooksStatus] = useState<{
    favorite: 'idle' | 'yes' | 'no';
    taskCompleted: 'idle' | 'yes' | 'no';
  }>({ favorite: 'idle', taskCompleted: 'idle' });
  const [playlistsImage, setPlaylistsImage] = useState<File | null>(null);
  const [moviesImage, setMoviesImage] = useState<File | null>(null);
  const [savingImages, setSavingImages] = useState(false);
  const [hooksApplied, setHooksApplied] = useState(false);

  const step4Busy = applyingHooks || creatingWatchlists || savingImages;

  const handleTestConnection = async () => {
    setTesting(true);
    try {
      const result = await postJson<{ ok: boolean }>('test-connection', { apiBaseUrl });
      setTestPassed(result.ok);
      toast({
        title: result.ok ? 'Connection OK' : 'Could not reach that URL',
        description: result.ok
          ? 'Jellyfin responded - you can install the plugin now.'
          : 'Double check the API base endpoint and try again.',
        variant: result.ok ? 'success' : 'destructive',
        duration: 4000
      });
    } catch {
      setTestPassed(false);
      toast({ title: 'Test failed', variant: 'destructive', duration: 4000 });
    } finally {
      setTesting(false);
    }
  };

  const handleInstallPlugin = async () => {
    setInstalling(true);
    try {
      const result = await postJson<{ ok: boolean; message: string }>('install-plugin');
      setInstalled(result.ok);
      toast({
        title: result.ok ? 'Webhook plugin installed' : 'Install failed',
        description: result.message,
        variant: result.ok ? 'success' : 'destructive',
        duration: 5000
      });
    } catch {
      toast({ title: 'Failed to install plugin', variant: 'destructive', duration: 4000 });
    } finally {
      setInstalling(false);
    }
  };

  const handleRestart = async () => {
    setRestarting(true);
    try {
      const result = await postJson<{ ok: boolean; message: string }>('restart');
      toast({ title: 'Restart triggered', description: result.message, duration: 5000 });
    } catch {
      toast({
        title: 'Restart triggered',
        description: 'The connection dropped, which is expected during a restart.',
        duration: 5000
      });
    } finally {
      setHasRestarted(true);
      setServerConfirmedUp(false);
      setRestarting(false);
    }
  };

  const handleCheckConnection = async () => {
    setCheckingConnection(true);
    try {
      const result = await postJson<{ up: boolean }>('check-connection');
      setServerConfirmedUp(result.up);
      toast({
        title: result.up ? 'Jellyfin is up' : 'Jellyfin is not responding',
        variant: result.up ? 'success' : 'destructive',
        duration: 4000
      });
    } catch {
      setServerConfirmedUp(false);
      toast({ title: 'Jellyfin is not responding', variant: 'destructive', duration: 4000 });
    } finally {
      setCheckingConnection(false);
    }
  };

  const handleApplyHooks = async () => {
    setApplyingHooks(true);
    try {
      const result = await postJson<{ favorite: boolean; taskCompleted: boolean }>('apply-hooks');
      setHooksStatus({
        favorite: result.favorite ? 'yes' : 'no',
        taskCompleted: result.taskCompleted ? 'yes' : 'no'
      });
      setHooksApplied(true);
      toast({ title: 'Hooks applied', variant: 'success', duration: 4000 });
    } catch {
      toast({ title: 'Failed to apply hooks', variant: 'destructive', duration: 4000 });
    } finally {
      setApplyingHooks(false);
    }
  };

  const handleCreateWatchlists = async () => {
    setCreatingWatchlists(true);
    try {
      const result = await postJson<{
        total: number;
        favoritesAdded: number;
        favoritesFailed: number;
        failed: Array<{ userId: string; name: string; error: string }>;
      }>('create-watchlists');
      const hasFailures = result.failed.length > 0 || result.favoritesFailed > 0;
      toast({
        title: 'Watchlists created',
        description: [
          result.failed.length > 0
            ? `Applied to ${result.total - result.failed.length} of ${result.total} user(s), ${result.failed.length} failed.`
            : `Applied to all ${result.total} user(s).`,
          result.favoritesAdded > 0 || result.favoritesFailed > 0
            ? `${result.favoritesAdded} existing favorite(s) backfilled${result.favoritesFailed > 0 ? `, ${result.favoritesFailed} failed` : ''}.`
            : 'No existing favorites to backfill.'
        ].join(' '),
        variant: hasFailures ? 'destructive' : 'success',
        duration: 6000
      });
    } catch {
      toast({ title: 'Failed to create watchlists', variant: 'destructive', duration: 4000 });
    } finally {
      setCreatingWatchlists(false);
    }
  };

  const handleSaveImages = async () => {
    if (!moviesImage && !playlistsImage) {
      return;
    }
    setSavingImages(true);
    try {
      const formData = new FormData();
      if (moviesImage) formData.append('moviesImage', moviesImage);
      if (playlistsImage) formData.append('playlistsImage', playlistsImage);

      const res = await fetch('/api/watchlist-settings', { method: 'POST', body: formData });
      if (!res.ok) {
        throw new Error('Failed to save images');
      }

      setMoviesImage(null);
      setPlaylistsImage(null);
      toast({ title: 'Images saved', variant: 'success', duration: 4000 });
    } catch {
      toast({ title: 'Failed to save images', variant: 'destructive', duration: 4000 });
    } finally {
      setSavingImages(false);
    }
  };

  return (
    <Card className="flex flex-col w-full gap-6 p-10">
      <CardHeader className="p-0">
        <CardTitle>Set up Watchlist (Step {step} of 4)</CardTitle>
      </CardHeader>

      {step === 1 && (
        <div className="flex flex-col gap-4 max-w-lg">
          <CardDescription>
            Enable Watchlist for movies and series feature for every user.
          </CardDescription>
          <Button className="self-start" onClick={() => setStep(pluginAlreadyInstalled ? 3 : 2)}>
            Start Setup
          </Button>
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-col gap-4 max-w-lg">
          <CardDescription>
            First, confirm Jellydash can reach your Jellyfin server, then install the Webhook plugin
            from Jellyfin&apos;s official catalog.
          </CardDescription>

          <Label htmlFor="apiBaseUrl" className="flex flex-col gap-1">
            Jellyfin API base endpoint
            <Input
              id="apiBaseUrl"
              value={apiBaseUrl}
              onChange={(e) => {
                setApiBaseUrl(e.target.value);
                setTestPassed(false);
              }}
              disabled={testing || installing || installed}
            />
          </Label>

          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={handleTestConnection}
              disabled={testing || installing || installed}
            >
              {testing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Test Communication
            </Button>
            <Button onClick={handleInstallPlugin} disabled={!testPassed || installing || installed}>
              {installing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {installed ? 'Plugin Installed' : 'Install Webhook Plugin'}
            </Button>
          </div>

          {installed && (
            <Button className="self-start" onClick={() => setStep(3)}>
              Continue
            </Button>
          )}
        </div>
      )}

      {step === 3 && (
        <div className="flex flex-col gap-4 max-w-lg">
          <CardDescription>
            A fresh plugin install only takes effect after Jellyfin restarts. Restart it, then
            confirm it came back up before continuing.
          </CardDescription>

          <div className="flex flex-wrap gap-2">
            <Button variant="destructive" onClick={handleRestart} disabled={restarting}>
              {restarting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Restart Jellyfin
            </Button>
            <Button variant="outline" onClick={handleCheckConnection} disabled={checkingConnection}>
              {checkingConnection ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Check Jellyfin Server Connection
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={() => setStep(4)} disabled={!hasRestarted || !serverConfirmedUp}>
              Continue
            </Button>
            {!hasRestarted && (
              <Button onClick={() => setHasRestarted(true)} disabled={!serverConfirmedUp}>
                Already Restarted
              </Button>
            )}
          </div>
          {(!hasRestarted || !serverConfirmedUp) && (
            <CardDescription className="text-xs">
              Check the connection and confirm the server is back up before continuing.
            </CardDescription>
          )}
        </div>
      )}

      {step === 4 && (
        <div className="flex flex-col gap-4 max-w-lg">
          <CardDescription>
            Apply Hooks adds the two Generic Destinations the Watchlist needs: one that reacts to
            favorites, and one that re-applies the custom name/thumbnail after every library scan.
            Any other destinations you&apos;ve already configured are left untouched.
          </CardDescription>

          <div className="flex items-center gap-2 text-sm">
            <StatusIcon state={hooksStatus.favorite} /> Favorites hook
            <StatusIcon state={hooksStatus.taskCompleted} /> Scan-protection hook
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={handleApplyHooks} disabled={step4Busy}>
              {applyingHooks ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Apply Hooks
            </Button>
            <Button
              variant="secondary"
              onClick={handleCreateWatchlists}
              disabled={step4Busy || !hooksApplied}
            >
              {creatingWatchlists ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Create Watchlists
            </Button>
          </div>
          <CardDescription>
            Create Watchlists makes the playlist for every user right away, even ones with no
            favorites yet, instead of waiting for their first favorite.
          </CardDescription>

          <div className="flex flex-col gap-3 border rounded-lg p-4">
            <div className="font-medium text-sm">Images (optional)</div>
            <CardDescription>
              Set these now if you want, or skip them and set them later from this page.
            </CardDescription>

            <Label htmlFor="wizardPlaylistsImage" className="flex flex-col gap-1">
              &quot;Playlists&quot; tile thumbnail
              <Input
                id="wizardPlaylistsImage"
                type="file"
                accept="image/png,image/jpeg"
                onChange={(e) => setPlaylistsImage(e.target.files?.[0] ?? null)}
                disabled={step4Busy}
              />
            </Label>

            <Label htmlFor="wizardMoviesImage" className="flex flex-col gap-1">
              Watchlist playlist primary image
              <Input
                id="wizardMoviesImage"
                type="file"
                accept="image/png,image/jpeg"
                onChange={(e) => setMoviesImage(e.target.files?.[0] ?? null)}
                disabled={step4Busy}
              />
            </Label>

            <Button
              variant="secondary"
              className="self-start"
              onClick={handleSaveImages}
              disabled={step4Busy || (!moviesImage && !playlistsImage)}
            >
              {savingImages ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save Images
            </Button>
          </div>

          <Button className="self-start" onClick={onComplete} disabled={step4Busy}>
            Continue
          </Button>
        </div>
      )}
    </Card>
  );
}
