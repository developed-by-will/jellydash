'use client';

import { LibraryWithRoles } from '@/app/api/libraries/roles/route';
import { bgDestructive, bgSuccess } from '@/app/constants';
import { Role } from '@/app/db/packages';
import { toast } from '@/components/breeze-ui/toast/hooks/use-toast';
import { DataTableColumnHeader } from '@/components/breeze-ui/data-table';
import { Badge } from '@/components/ui/badge';
import { useMutationHandler } from '@/hooks/useMutationHandler';
import useQueryHandler from '@/hooks/useQueryHandler';
import { ColumnDef } from '@tanstack/react-table';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

function RolesCell({ library }: Readonly<{ library: LibraryWithRoles }>) {
  const [pendingList, setPendingList] = useState<string | null>(null);

  // Cached/deduped by react-query across every row - only actually fetched once per page load.
  const { data: roles } = useQueryHandler<Role[]>({
    queryKey: 'roles',
    endpoint: 'roles'
  });

  const { mutateAsync: addToList } = useMutationHandler({
    endpoint: 'libraries/membership',
    method: 'POST',
    mutationKey: 'library-membership-add',
    invalidateQueryKeys: ['libraries-roles']
  });

  const { mutateAsync: removeFromList } = useMutationHandler({
    endpoint: 'libraries/membership',
    method: 'DELETE',
    mutationKey: 'library-membership-remove',
    invalidateQueryKeys: ['libraries-roles']
  });

  const toggle = async (list: string, label: string, active: boolean) => {
    setPendingList(list);

    try {
      if (active) {
        await removeFromList({ id: library.id, list });
      } else {
        await addToList({ id: library.id, name: library.name, list });
      }
    } catch (err: any) {
      toast({
        title: 'Failed to update access',
        description: err?.message ?? `Could not update ${label} for ${library.name}`,
        variant: 'destructive',
        duration: 4000
      });
    } finally {
      setPendingList(null);
    }
  };

  const badges = [
    ...(roles ?? []).map((role) => ({
      list: role.id,
      label: role.name,
      active: library.roles.includes(role.id),
      activeClass: bgSuccess,
      inactiveClass: bgDestructive
    })),
    {
      list: 'EXCLUDED',
      label: 'EXCLUDED',
      active: library.excluded,
      activeClass: 'bg-amber-600 hover:bg-amber-700 text-white',
      inactiveClass: 'bg-transparent border border-input text-muted-foreground hover:bg-accent'
    }
  ];

  return (
    <div className="flex flex-wrap gap-1">
      {badges.map((badge) => {
        const isPending = pendingList === badge.list;

        return (
          <Badge
            key={badge.list}
            onClick={() => !pendingList && toggle(badge.list, badge.label, badge.active)}
            className={`text-xs cursor-pointer select-none ${badge.active ? badge.activeClass : badge.inactiveClass} ${
              pendingList && !isPending ? 'opacity-50 pointer-events-none' : ''
            }`}
            title={`Click to ${badge.active ? 'remove from' : 'add to'} ${badge.label}`}
          >
            {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : badge.label}
          </Badge>
        );
      })}
    </div>
  );
}

export const columns: ColumnDef<LibraryWithRoles>[] = [
  {
    accessorKey: 'name',
    meta: { justAFlag: true },
    header: ({ column }) => <DataTableColumnHeader column={column} title="Library" />,
    cell: ({ row }) => row.getValue('name')
  },
  {
    id: 'roles',
    header: 'Roles',
    cell: ({ row }) => <RolesCell library={row.original} />
  }
];
