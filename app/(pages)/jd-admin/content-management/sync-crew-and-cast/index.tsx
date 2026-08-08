'use client';

import { toast } from '@/components/breeze-ui/toast/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useState } from 'react';

type PersonResult =
  | { id: string; name: string; status: 'success'; hasImageNow: boolean }
  | { id: string; name: string; status: 'failed'; error: unknown }
  | { status: 'aborted'; message: string };

type SyncDetails = {
  totalPersons: number;
  missingImages: number;
  processedCount: number;
  forceFlagUsed: boolean;
  consecutiveErrorsOccurred: number;
  results: PersonResult[];
  skippedPreviouslyProcessed: number;
};

function StatCard({ label, value }: Readonly<{ label: string; value: number | string }>) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border p-4">
      <span className="text-2xl font-semibold">{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

export default function SyncCrewAndCast() {
  const { data: session } = useSession();
  const userId = session?.user.JellyfinSession?.User.Id;
  const accessToken = session?.user.JellyfinSession?.AccessToken;

  const [force, setForce] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [details, setDetails] = useState<SyncDetails | null>(null);

  const failedResults = (details?.results ?? []).filter(
    (r): r is Extract<PersonResult, { status: 'failed' }> => r.status === 'failed'
  );
  const wasAborted = details?.results.some((r) => r.status === 'aborted') ?? false;

  const handleSync = async () => {
    if (!userId || !accessToken) {
      toast({
        title: 'Not signed in',
        description: 'No active Jellyfin session was found.',
        variant: 'destructive',
        duration: 5000
      });
      return;
    }

    if (force) {
      const confirmed = window.confirm(
        'This re-processes every cast & crew member, not just the ones missing images. On large libraries this can take a while, since each person is fetched one at a time. Continue?'
      );
      if (!confirmed) return;
    }

    setIsSyncing(true);
    setDetails(null);

    try {
      const params = new URLSearchParams({ userId, force: String(force) });
      const res = await fetch(`/api/persons?${params.toString()}`, {
        method: 'PATCH',
        headers: { 'x-access-token': accessToken }
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message ?? data?.error ?? 'Failed to sync crew & cast');
      }

      const syncDetails: SyncDetails = data.details;
      setDetails(syncDetails);

      const failedCount = syncDetails.results.filter((r) => r.status === 'failed').length;
      const aborted = syncDetails.results.some((r) => r.status === 'aborted');

      toast({
        title: aborted
          ? 'Stopped early after repeated errors'
          : failedCount > 0
            ? 'Finished with some errors'
            : 'Sync complete',
        description: data.message,
        variant: aborted || failedCount > 0 ? 'warning' : 'success',
        duration: 6000
      });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err?.message ?? 'Failed to sync crew & cast',
        variant: 'destructive',
        duration: 6000
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <Card className="flex flex-col gap-6 p-10">
        <CardHeader className="p-0">
          <CardTitle>Sync Crew & Cast</CardTitle>
          <CardDescription>
            Fetches every actor, director and crew member from Jellyfin and refreshes the ones
            missing a photo, so they display correctly across the library. Runs one person at a
            time with a short delay between requests, so it can take a while on large libraries.
          </CardDescription>
        </CardHeader>

        <div className="flex items-center gap-2">
          <Checkbox
            id="force"
            checked={force}
            onCheckedChange={(checked) => setForce(checked === true)}
            disabled={isSyncing}
          />
          <Label htmlFor="force" className="cursor-pointer font-normal">
            Resync everyone, including people already processed
          </Label>
        </div>

        <Button className="self-start" onClick={handleSync} disabled={isSyncing || !userId}>
          {isSyncing && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          {isSyncing ? 'Syncing...' : 'Sync Crew & Cast'}
        </Button>
      </Card>

      {details && (
        <Card className="flex flex-col gap-6 p-10">
          <CardHeader className="p-0">
            <CardTitle className="flex items-center gap-2">
              {wasAborted || failedResults.length > 0 ? (
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
              ) : (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              )}
              Last Run Results
            </CardTitle>
            {wasAborted && (
              <CardDescription className="text-destructive">
                Stopped early after {details.consecutiveErrorsOccurred} consecutive errors.
              </CardDescription>
            )}
          </CardHeader>

          <div
            className="grid gap-4"
            style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}
          >
            <StatCard label="Total crew & cast" value={details.totalPersons} />
            <StatCard label="Missing images before run" value={details.missingImages} />
            <StatCard label="Processed this run" value={details.processedCount} />
            <StatCard label="Skipped (already done)" value={details.skippedPreviouslyProcessed} />
            <StatCard label="Failed" value={failedResults.length} />
          </div>

          {failedResults.length > 0 && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">Failures</span>
                <Badge variant="destructive">{failedResults.length}</Badge>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Id</TableHead>
                    <TableHead>Error</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {failedResults.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>{r.name}</TableCell>
                      <TableCell className="text-muted-foreground text-xs">{r.id}</TableCell>
                      <TableCell className="text-xs">{String(r.error)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
