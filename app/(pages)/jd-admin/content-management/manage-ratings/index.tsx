'use client';

import { Rating } from '@/app/db/ratings';
import { DataTable } from '@/components/breeze-ui/data-table/data-table';
import { toast } from '@/components/breeze-ui/toast/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMutationHandler } from '@/hooks/useMutationHandler';
import useQueryHandler from '@/hooks/useQueryHandler';
import { Loader2, Plus } from 'lucide-react';
import { useState } from 'react';
import { columns } from './data-table/columns';

export default function ManageRatings() {
  const [createOpen, setCreateOpen] = useState(false);
  const [label, setLabel] = useState('');
  const [value, setValue] = useState('');

  const { data, isError, error, isPending } = useQueryHandler<Rating[]>({
    queryKey: 'ratings',
    endpoint: 'ratings'
  });

  const { mutateAsync: createRating, isPending: isCreating } = useMutationHandler({
    endpoint: 'ratings',
    method: 'POST',
    mutationKey: 'ratings-create',
    invalidateQueryKeys: ['ratings']
  });

  const handleCreate = async () => {
    try {
      await createRating({ label, value });
      toast({
        title: 'Rating created',
        description: `${label} is now available in the Rate Content picker.`,
        variant: 'success',
        duration: 4000
      });
      setLabel('');
      setValue('');
      setCreateOpen(false);
    } catch (err: any) {
      toast({
        title: 'Failed to create rating',
        description: err?.message ?? 'Could not create rating',
        variant: 'destructive',
        duration: 4000
      });
    }
  };

  if (isError) {
    console.error(error);
    return <div>Error loading ratings: {error.message}</div>;
  }

  return (
    <Card className="flex flex-col w-full gap-5 p-10">
      <CardHeader className="p-0 flex-row items-center justify-between">
        <div>
          <CardTitle>Manage Ratings</CardTitle>
          <CardDescription>
            The list of parental ratings offered on the Rate Content page. Label is what&apos;s
            shown in the picker, Value is what gets written as the item&apos;s official rating.
          </CardDescription>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Rating
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

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Rating</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <Label htmlFor="new-rating-label" className="flex flex-col gap-1">
              Label
              <Input
                id="new-rating-label"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                disabled={isCreating}
                placeholder="e.g. M/16"
              />
            </Label>

            <Label htmlFor="new-rating-value" className="flex flex-col gap-1">
              Value
              <Input
                id="new-rating-value"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                disabled={isCreating}
                placeholder="e.g. M/16"
              />
            </Label>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)} disabled={isCreating}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={isCreating || !label.trim() || !value.trim()}>
              {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
