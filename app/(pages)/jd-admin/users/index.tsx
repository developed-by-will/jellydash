'use client';

import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

export default function Users() {
  const { data: session } = useSession();

  const { isError, error, data, isLoading } = useQuery({
    queryKey: ['get-all-users'],
    queryFn: async () => {
      const res = await fetch('/api/users/all', {
        headers: {
          SERVER_TOKEN: `${session?.user?.jellyfinToken}`
        }
      });

      if (!res.ok) {
        throw new Error('Failed to fetch users');
      }

      return res.json();
    }
  });

  if (isLoading) {
    return <div>Loading users...</div>;
  }

  if (isError) {
    console.error(error);
    return <div>Error loading users: {error.message}</div>;
  }

  return (
    <div>
      <div>Users</div>
    </div>
  );
}
