import { useMutation, UseMutationResult, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

type UseMutationHandlerProps<TPayload, TResponse> = {
  mutationKey: string;
  endpoint: string;
  requiresAuth?: boolean;
  invalidateQueryKeys?: string[];
  method?: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
};

type Headers = Record<string, string>;

export default function useMutationHandler<TPayload, TResponse>(
  props: UseMutationHandlerProps<TPayload, TResponse>
): UseMutationResult<TResponse, Error, TPayload> {
  const {
    mutationKey,
    endpoint,
    requiresAuth = true,
    invalidateQueryKeys = [],
    method = 'POST'
  } = props;

  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation<TResponse, Error, TPayload>({
    mutationKey: [mutationKey],
    mutationFn: async (payload: TPayload) => {
      const headers: Headers = {
        'Content-Type': 'application/json'
      };

      if (requiresAuth) {
        if (!session?.user?.JellyfinSession?.AccessToken) {
          throw new Error('Authentication required but no token available');
        }
        headers['ACCESS_TOKEN'] = session.user.JellyfinSession?.AccessToken;
      }

      const res = await fetch(`/api/${endpoint}`, {
        method,
        headers,
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error(`Failed to ${method} ${endpoint}`);
      }

      return res.json();
    },
    onSuccess: () => {
      // Auto-refresh queries if specified
      invalidateQueryKeys.forEach((key) => queryClient.invalidateQueries({ queryKey: [key] }));
    }
  });
}
