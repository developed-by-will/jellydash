'use client';

import { Rating } from '@/app/db/ratings';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DataTableColumnHeader } from '@/components/breeze-ui/data-table';
import { toast } from '@/components/breeze-ui/toast/hooks/use-toast';
import { useMutationHandler } from '@/hooks/useMutationHandler';
import { ColumnDef } from '@tanstack/react-table';
import { Loader2, MoreHorizontal } from 'lucide-react';
import { useState } from 'react';

function ActionsCell(rating: Readonly<Rating>) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [label, setLabel] = useState(rating.label);
  const [value, setValue] = useState(rating.value);

  const { mutateAsync: updateRating, isPending: isUpdating } = useMutationHandler({
    endpoint: 'ratings',
    method: 'PATCH',
    mutationKey: 'ratings-update',
    invalidateQueryKeys: ['ratings']
  });

  const { mutateAsync: deleteRating, isPending: isDeleting } = useMutationHandler({
    endpoint: 'ratings',
    method: 'DELETE',
    mutationKey: 'ratings-delete',
    invalidateQueryKeys: ['ratings']
  });

  const handleSave = async () => {
    try {
      await updateRating({ id: rating.id, label, value });
      setEditOpen(false);
    } catch (err: any) {
      toast({
        title: 'Failed to update rating',
        description: err?.message ?? `Could not update ${rating.label}`,
        variant: 'destructive',
        duration: 4000
      });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteRating({ id: rating.id });
      setDeleteOpen(false);
    } catch (err: any) {
      toast({
        title: 'Failed to delete rating',
        description: err?.message ?? `Could not delete ${rating.label}`,
        variant: 'destructive',
        duration: 4000
      });
    }
  };

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="flex gap-2 flex-col">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>

          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault();
              setLabel(rating.label);
              setValue(rating.value);
              setEditOpen(true);
            }}
            className="cursor-pointer"
          >
            Edit Rating
          </DropdownMenuItem>

          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault();
              setDeleteOpen(true);
            }}
            className="cursor-pointer text-destructive"
          >
            Delete Rating
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Rating</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <Label htmlFor="rating-label" className="flex flex-col gap-1">
              Label
              <Input
                id="rating-label"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                disabled={isUpdating}
              />
            </Label>

            <Label htmlFor="rating-value" className="flex flex-col gap-1">
              Value
              <Input
                id="rating-value"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                disabled={isUpdating}
              />
            </Label>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)} disabled={isUpdating}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isUpdating || !label.trim() || !value.trim()}>
              {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete &quot;{rating.label}&quot;?</DialogTitle>
          </DialogHeader>

          <p className="text-sm text-muted-foreground">
            This removes it from the picker. Items already tagged with this rating in Jellyfin keep
            that value.
          </p>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export const columns: ColumnDef<Rating>[] = [
  {
    accessorKey: 'label',
    meta: { justAFlag: true },
    header: ({ column }) => <DataTableColumnHeader column={column} title="Label" />,
    cell: ({ row }) => row.getValue('label')
  },
  {
    accessorKey: 'value',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Value" />,
    cell: ({ row }) => row.getValue('value')
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => <ActionsCell {...row.original} />
  }
];
