import { useQuery, useQueryClient, UseQueryResult } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

type UseQueryHandlerProps = {
  queryKey: string;
  endpoint: string;
  requiresAuth?: boolean;
  invalidateQueryKeys?: string[];
};

type Headers = Record<string, string>;

export default function useQueryHandler<T>(
  props: UseQueryHandlerProps
): UseQueryResult<T[], Error> {
  const { queryKey, endpoint, requiresAuth = true, invalidateQueryKeys = [] } = props;
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  console.log('session', session);

  return useQuery<T[]>({
    queryKey: [queryKey],
    queryFn: async () => {
      const headers: Headers = {};

      if (requiresAuth) {
        if (!session?.user?.JellyfinSession?.AccessToken) {
          throw new Error('Authentication required but no token available');
        }
        headers['ACCESS_TOKEN'] = session.user.JellyfinSession.AccessToken;
      }

      const res = await fetch(`/api/${endpoint}`, {
        headers
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch ${endpoint}`);
      }

      invalidateQueryKeys.forEach((key) => queryClient.invalidateQueries({ queryKey: [key] }));

      return res.json();
    },
    enabled: requiresAuth ? !!session?.user?.JellyfinSession?.AccessToken : true
  });
}
