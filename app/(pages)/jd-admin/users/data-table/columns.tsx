'use client';

import { User } from '@/app/api/types';
import { AUTENTICATED_POST } from '@/app/utils/requestHandler';
import { DataTableColumnHeader } from '@/components/breeze-ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useQueryClient } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { Loader2, MoreHorizontal } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { formatDate } from './helpers';

const success = 'bg-emerald-600 hover:bg-emerald-700 text-sm';

function ActionsCell(user: Readonly<User>) {
  const { data: session } = useSession();
  const token = session?.user.jellyfinToken ?? '';
  const [isUpdating, setIsUpdating] = useState(false);
  const queryClient = useQueryClient();

  const handleStatusToggle = async () => {
    setIsUpdating(true);

    await AUTENTICATED_POST(
      `/api/users/update-status`,
      { Id: user.Id, IsDisabled: !user.Policy.IsDisabled },
      token
    );

    queryClient.invalidateQueries({ queryKey: ['users-all'] });
    setIsUpdating(false);
  };

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0" disabled={isUpdating}>
          <span className="sr-only">Open menu</span>
          {isUpdating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <MoreHorizontal className="h-4 w-4" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem
          onClick={() => navigator.clipboard.writeText(user.Id)}
          className="cursor-pointer"
        >
          Copy ID
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleStatusToggle}
          disabled={isUpdating}
          className="cursor-pointer"
        >
          {user.Policy.IsDisabled ? 'Enable User' : 'Disable User'}
        </DropdownMenuItem>
        <DropdownMenuItem>Remove User</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
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
        <Badge variant="default" className={success}>
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
