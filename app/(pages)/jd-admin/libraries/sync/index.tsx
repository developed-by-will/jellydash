'use client';

import { LibraryWithRoles } from '@/app/api/libraries/roles/route';
import { toast } from '@/components/breeze-ui/toast/hooks/use-toast';
import { DataTable } from '@/components/breeze-ui/data-table/data-table';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import useQueryHandler from '@/hooks/useQueryHandler';
import { RefreshCw } from 'lucide-react';
import { columns } from './data-table/columns';

export default function SyncLibraries() {
  const {
    data,
    isError,
    error,
    isPending,
    isFetching,
    refetch
  } = useQueryHandler<LibraryWithRoles[]>({
    queryKey: 'libraries-roles',
    endpoint: 'libraries/roles'
  });

  const handleSync = async () => {
    try {
      await refetch();

      toast({
        title: 'Libraries synced',
        description: 'Pulled the latest library list from Jellyfin.',
        variant: 'success',
        duration: 4000
      });
    } catch (err: any) {
      toast({
        title: 'Sync failed',
        description: err?.message ?? 'Failed to sync libraries',
        variant: 'destructive',
        duration: 4000
      });
    }
  };

  if (isError) {
    console.error(error);
    return <div>Error loading libraries: {error.message}</div>;
  }

  return (
    <Card className="flex flex-col w-full gap-5 p-10">
      <CardHeader className="p-0 flex-row items-center justify-between">
        <div>
          <CardTitle>Libraries</CardTitle>
          <CardDescription>
            Every library Jellyfin currently reports. Click a badge to grant or revoke that
            role&apos;s access.
          </CardDescription>
        </div>

        <Button onClick={handleSync} disabled={isFetching}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
          {isFetching ? 'Syncing...' : 'Sync'}
        </Button>
      </CardHeader>

      <DataTable
        columns={columns}
        data={data || []}
        loading={isPending}
        pagination
        filterInput
        loadingSkeletonHeight={400}
      />
    </Card>
  );
}
