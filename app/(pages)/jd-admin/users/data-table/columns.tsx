'use client';

import { User } from '@/app/api/types';
import { bgSuccess } from '@/app/constants';
import { AUTENTICATED_POST, DELETE } from '@/app/utils/requestHandler';
import { DataTableColumnHeader } from '@/components/breeze-ui/data-table';
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
import { useQueryClient } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { Loader2, MoreHorizontal } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { formatDate } from './helpers';

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
    cell: ({ row }) => row.original.Policy?.MaxParentalRating ?? '—'
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
