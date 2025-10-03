import { useQuery, useQueryClient, UseQueryResult } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

type UseQueryHandlerProps = {
  queryKey: string | unknown[];
  endpoint: string;
  requiresAuth?: boolean;
  invalidateQueryKeys?: (string | unknown[])[];
  enabled?: boolean;
};

type Headers = Record<string, string>;

export default function useQueryHandler<T>(
  props: UseQueryHandlerProps
): UseQueryResult<T[], Error> {
  const {
    queryKey,
    endpoint,
    requiresAuth = true,
    invalidateQueryKeys = [],
    enabled = true
  } = props;

  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useQuery<T[]>({
    queryKey: Array.isArray(queryKey) ? queryKey : [queryKey],
    queryFn: async () => {
      const headers: Headers = {};

      if (requiresAuth) {
        if (!session?.user?.JellyfinSession?.AccessToken) {
          throw new Error('Authentication required but no token available');
        }
        headers['ACCESS_TOKEN'] = session.user.JellyfinSession.AccessToken;
      }

      const res = await fetch(`/api/${endpoint}`, { headers });

      if (!res.ok) {
        throw new Error(`Failed to fetch ${endpoint}`);
      }

      for (const key of invalidateQueryKeys) {
        queryClient.invalidateQueries({
          queryKey: Array.isArray(key) ? key : [key]
        });
      }

      return res.json();
    },
    enabled: enabled && (requiresAuth ? !!session?.user?.JellyfinSession?.AccessToken : true)
  });
}
