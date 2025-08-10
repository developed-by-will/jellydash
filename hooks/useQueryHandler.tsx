import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

type UseQueryHandlerProps = {
  queryKey: string;
  endpoint: string;
  requiresAuth?: boolean;
};

type Headers = Record<string, string>;

export default function useQueryHandler<T>(
  props: UseQueryHandlerProps
): UseQueryResult<T[], Error> {
  const { queryKey, endpoint, requiresAuth = true } = props;
  const { data: session } = useSession();

  return useQuery<T[]>({
    queryKey: [queryKey],
    queryFn: async () => {
      const headers: Headers = {};

      if (requiresAuth) {
        if (!session?.user?.jellyfinToken) {
          throw new Error('Authentication required but no token available');
        }
        headers['SERVER_TOKEN'] = session.user.jellyfinToken;
      }

      const res = await fetch(`/api/${endpoint}`, {
        headers
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch ${endpoint}`);
      }

      return res.json();
    },
    enabled: requiresAuth ? !!session?.user?.jellyfinToken : true
  });
}
