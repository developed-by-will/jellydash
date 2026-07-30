'use client';

import { LibraryWithRoles } from '@/app/api/libraries/roles/route';
import { MembershipList } from '@/app/api/libraries/membership/route';
import { bgDestructive, bgSuccess } from '@/app/constants';
import { ToggleableRole } from '@/app/db/packages';
import { toast } from '@/components/breeze-ui/toast/hooks/use-toast';
import { DataTableColumnHeader } from '@/components/breeze-ui/data-table';
import { Badge } from '@/components/ui/badge';
import { useMutationHandler } from '@/hooks/useMutationHandler';
import { ColumnDef } from '@tanstack/react-table';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

// PREMIUM isn't listed here - it has no library list of its own, it just mirrors STANDARD
// with download permission added on top (see app/db/packages.ts).
const ALL_ROLES: ToggleableRole[] = ['STANDARD', 'CHILDREN', 'ADMIN'];

function RolesCell({ library }: Readonly<{ library: LibraryWithRoles }>) {
  const [pendingList, setPendingList] = useState<MembershipList | null>(null);

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

  const toggle = async (list: MembershipList, active: boolean) => {
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
        description: err?.message ?? `Could not update ${list} for ${library.name}`,
        variant: 'destructive',
        duration: 4000
      });
    } finally {
      setPendingList(null);
    }
  };

  const badges = [
    ...ALL_ROLES.map((role) => ({
      list: role as MembershipList,
      label: role,
      active: library.roles.includes(role),
      activeClass: bgSuccess,
      inactiveClass: bgDestructive
    })),
    {
      list: 'EXCLUDED' as MembershipList,
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
            key={badge.label}
            onClick={() => !pendingList && toggle(badge.list, badge.active)}
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
