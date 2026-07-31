'use client';

import { User } from '@/app/api/types';
import { bgSuccess } from '@/app/constants';
import { Rating } from '@/app/db/ratings';
import { AUTENTICATED_POST, DELETE } from '@/app/utils/requestHandler';
import { DataTableColumnHeader } from '@/components/breeze-ui/data-table';
import { toast } from '@/components/breeze-ui/toast/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { useQueryClient } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { Loader2, MoreHorizontal } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { formatDate } from './helpers';

const NO_CAP = '__no-cap__';

// Ratings are managed as label/value pairs (see Parental Ratings → Manage Ratings), but Jellyfin's MaxParentalRating
// is a plain number. Values like "M/16" carry that number in the string, so we pull it out rather
// than maintaining a second parallel numeric field.
function extractRatingNumber(value: string): number | null {
  const match = value.match(/\d+/);
  return match ? Number(match[0]) : null;
}

function MaxRatingCell({ user }: Readonly<{ user: User }>) {
  const [isSaving, setIsSaving] = useState(false);

  const { data: ratings } = useQueryHandler<Rating[]>({
    queryKey: 'ratings',
    endpoint: 'ratings'
  });

  const { mutateAsync: updateMaxRating } = useMutationHandler({
    endpoint: 'users/update-parental-rating',
    method: 'POST',
    mutationKey: 'users-update-parental-rating',
    invalidateQueryKeys: ['users-all']
  });

  if (user.Policy?.IsAdministrator) return '—';

  const currentRatingId =
    user.Policy?.MaxParentalRating == null
      ? NO_CAP
      : ((ratings ?? []).find(
          (rating) => extractRatingNumber(rating.value) === user.Policy?.MaxParentalRating
        )?.id ?? NO_CAP);

  const handleChange = async (ratingId: string) => {
    const selectedRating = (ratings ?? []).find((rating) => rating.id === ratingId);
    setIsSaving(true);

    try {
      await updateMaxRating({
        Id: user.Id,
        MaxParentalRating: selectedRating ? extractRatingNumber(selectedRating.value) : null
      });
    } catch (err: any) {
      toast({
        title: 'Failed to update rating',
        description: err?.message ?? `Could not update Max Parental Rating for ${user.Name}`,
        variant: 'destructive',
        duration: 4000
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Select value={currentRatingId} onValueChange={handleChange} disabled={isSaving}>
      <SelectTrigger className="w-[140px]">
        {isSaving ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <SelectValue placeholder="No cap" />
        )}
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
  );
}

function ActionsCell(user: Readonly<User>) {
  const { data: session } = useSession();
  const token = session?.user.JellyfinSession?.AccessToken ?? '';
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const handleStatusToggle = async () => {
    setIsLoading(true);

    await AUTENTICATED_POST(
      `/api/users/update-status`,
      { Id: user.Id, IsDisabled: !user.Policy.IsDisabled },
      token
    );

    queryClient.invalidateQueries({ queryKey: ['users-all'] });
    setIsLoading(false);
  };

  const handleUserRemove = async () => {
    setIsLoading(true);

    await DELETE(`/api/users/remove`, { Id: user.Id }, token);

    queryClient.invalidateQueries({ queryKey: ['users-all'] });
    setIsLoading(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  <Dialog open={open} onOpenChange={setOpen}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Are you absolutely sure?</DialogTitle>
        <DialogDescription>
          This action cannot be undone. This will permanently delete your account and remove your
          data from our servers.
        </DialogDescription>
      </DialogHeader>
    </DialogContent>
  </Dialog>;

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0" disabled={isLoading}>
            <span className="sr-only">Open menu</span>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MoreHorizontal className="h-4 w-4" />
            )}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="flex gap-2 flex-col">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>

          <DropdownMenuItem onClick={() => copyToClipboard(user.Id)} className={'cursor-pointer'}>
            Copy ID
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={handleStatusToggle}
            disabled={isLoading || user.Policy.IsAdministrator}
            className={'cursor-pointer'}
          >
            {user.Policy.IsDisabled ? 'Enable User' : 'Disable User'}
          </DropdownMenuItem>

          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault();
              setOpen(true);
            }}
            disabled={isLoading || user.Policy.IsAdministrator}
            className={'cursor-pointer'}
          >
            Remove User
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete this user.
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleUserRemove} disabled={isLoading}>
              {isLoading ? <Loader2 className="animate-spin" /> : 'Delete'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: 'Name',
    meta: { justAFlag: true },
    header: ({ column }) => <DataTableColumnHeader column={column} title="User" />,
    cell: ({ row }) => row.getValue('Name')
  },
  {
    accessorKey: 'LastActivityDate',
    meta: { justAFlag: true },
    header: ({ column }) => <DataTableColumnHeader column={column} title="Last Activity" />,
    cell: ({ row }) => <>{formatDate(row.getValue('LastActivityDate'))}</>
  },
  {
    id: 'MaxParentalRating',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Max Parental Rating" />,
    cell: ({ row }) => <MaxRatingCell user={row.original} />
  },
  {
    id: 'status',
    meta: { justAFlag: true },
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    accessorFn: (user) => user.Policy?.IsDisabled,
    cell: ({ row }) => {
      const isDisabled = row.getValue('status');
      return isDisabled ? (
        <Badge variant="destructive" className="text-sm">
          Disabled
        </Badge>
      ) : (
        <Badge variant="default" className={bgSuccess}>
          Active
        </Badge>
      );
    }
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => <ActionsCell {...row.original} />
  }
];
