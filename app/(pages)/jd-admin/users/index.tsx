'use client';

import { User } from '@/app/api/types';
import useQueryHandler from '@/hooks/useQueryHandler';

export default function Users() {
  const { data, isLoading, isError, error } = useQueryHandler<User>({
    queryKey: 'users-all',
    endpoint: 'users/all'
  });

  if (isLoading) {
    return <div>Loading users...</div>;
  }

  if (isError) {
    console.error(error);
    return <div>Error loading users: {error.message}</div>;
  }

  if (data) {
    console.log(data);
  }

  return (
    <div>
      <div>Users</div>
    </div>
  );
}
