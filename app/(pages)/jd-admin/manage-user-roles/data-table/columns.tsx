'use client';

import { Role } from '@/app/db/packages';
import { Rating } from '@/app/db/ratings';
import { DataTableColumnHeader } from '@/components/breeze-ui/data-table';
import { toast } from '@/components/breeze-ui/toast/hooks/use-toast';
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useMutationHandler } from '@/hooks/useMutationHandler';
import useQueryHandler from '@/hooks/useQueryHandler';
import { ColumnDef } from '@tanstack/react-table';
import { Loader2, MoreHorizontal } from 'lucide-react';
import { useState } from 'react';

const NO_CAP = '__no-cap__';

// Ratings are managed as label/value pairs (see Parental Ratings → Manage Ratings), but Jellyfin's MaxParentalRating
// is a plain number. Values like "M/16" carry that number in the string, so we pull it out rather
// than maintaining a second parallel numeric field.
function extractRatingNumber(value: string): number | null {
  const match = value.match(/\d+/);
  return match ? Number(match[0]) : null;
}

function MaxRatingCell({ role }: Readonly<{ role: Role }>) {
  const { data: ratings } = useQueryHandler<Rating[]>({
    queryKey: 'ratings',
    endpoint: 'ratings'
  });

  if (role.maxParentalRating == null) return '—';

  const matchingRating = (ratings ?? []).find(
    (rating) => extractRatingNumber(rating.value) === role.maxParentalRating
  );

  return matchingRating ? matchingRating.label : role.maxParentalRating;
}

function ActionsCell(role: Readonly<Role>) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [name, setName] = useState(role.name);
  const [selectedRatingId, setSelectedRatingId] = useState(NO_CAP);

  const { data: ratings } = useQueryHandler<Rating[]>({
    queryKey: 'ratings',
    endpoint: 'ratings'
  });

  const { mutateAsync: updateRole, isPending: isUpdating } = useMutationHandler({
    endpoint: 'roles',
    method: 'PATCH',
    mutationKey: 'roles-update',
    invalidateQueryKeys: ['roles']
  });

  const { mutateAsync: deleteRole, isPending: isDeleting } = useMutationHandler({
    endpoint: 'roles',
    method: 'DELETE',
    mutationKey: 'roles-delete',
    invalidateQueryKeys: ['roles', 'libraries-roles']
  });

  const openEdit = () => {
    setName(role.name);

    const matchingRating = (ratings ?? []).find(
      (rating) => extractRatingNumber(rating.value) === role.maxParentalRating
    );
    setSelectedRatingId(matchingRating?.id ?? NO_CAP);

    setEditOpen(true);
  };

  const handleSave = async () => {
    const selectedRating = (ratings ?? []).find((rating) => rating.id === selectedRatingId);

    try {
      await updateRole({
        id: role.id,
        name,
        maxParentalRating: selectedRating ? extractRatingNumber(selectedRating.value) : null
      });
      setEditOpen(false);
    } catch (err: any) {
      toast({
        title: 'Failed to update role',
        description: err?.message ?? `Could not update ${role.name}`,
        variant: 'destructive',
        duration: 4000
      });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteRole({ id: role.id });
      setDeleteOpen(false);
    } catch (err: any) {
      toast({
        title: 'Failed to delete role',
        description: err?.message ?? `Could not delete ${role.name}`,
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
              openEdit();
            }}
            className="cursor-pointer"
          >
            Edit Role
          </DropdownMenuItem>

          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault();
              setDeleteOpen(true);
            }}
            className="cursor-pointer text-destructive"
          >
            Delete Role
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Role</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <Label htmlFor="role-name" className="flex flex-col gap-1">
              Name
              <Input
                id="role-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isUpdating}
              />
            </Label>

            <div>
              Max Parental Rating (optional)
              <Select
                value={selectedRatingId}
                onValueChange={setSelectedRatingId}
                disabled={isUpdating}
              >
                <SelectTrigger>
                  <SelectValue placeholder="No cap" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Rating</SelectLabel>
                    <SelectItem value={NO_CAP} className="cursor-pointer">
                      No cap
                    </SelectItem>
                    {(ratings ?? []).map((rating) => (
                      <SelectItem key={rating.id} value={rating.id} className="cursor-pointer">
                        {rating.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)} disabled={isUpdating}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isUpdating || !name.trim()}>
              {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete &quot;{role.name}&quot;?</DialogTitle>
          </DialogHeader>

          <p className="text-sm text-muted-foreground">
            This removes the role and its library list. Users already created with this role keep
            their existing permissions.
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

export const columns: ColumnDef<Role>[] = [
  {
    accessorKey: 'name',
    meta: { justAFlag: true },
    header: ({ column }) => <DataTableColumnHeader column={column} title="Role" />,
    cell: ({ row }) => row.getValue('name')
  },
  {
    id: 'maxParentalRating',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Max Parental Rating" />,
    cell: ({ row }) => <MaxRatingCell role={row.original} />
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => <ActionsCell {...row.original} />
  }
];
