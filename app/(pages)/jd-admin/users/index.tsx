'use client';

import { User } from '@/app/api/types';
import { DataTable } from '@/components/breeze-ui/data-table/data-table';
import useQueryHandler from '@/hooks/useQueryHandler';
import { columns } from './data-table/columns';

export default function UsersPage() {
  const { data, isError, error, isPending, isFetching } = useQueryHandler<User>({
    queryKey: 'users-all',
    endpoint: 'users/all'
  });

  if (isError) {
    console.error(error);
    return <div>Error loading users: {error.message}</div>;
  }

  return (
    <DataTable
      columns={columns}
      data={data || []}
      loading={isPending || isFetching}
      pagination
      filterInput
      visibilityToggle
      loadingSkeletonHeight={695.5}
    />
  );
}
