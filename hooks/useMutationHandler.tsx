import { useMutation, UseMutationResult, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type UseMutationHandlerProps<TPayload, TResponse> = {
  mutationKey: string;
  endpoint: string;
  requiresAuth?: boolean;
  invalidateQueryKeys?: string[];
  method?: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
};

export type UseMutationBlobHandlerProps<TPayload, TResponse> = Omit<
  UseMutationHandlerProps<TPayload, TResponse>,
  'method'
> & {
  method?: 'POST';
};

type Headers = Record<string, string>;

export function useMutationHandler<TPayload, TResponse>(
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
        headers['x-access-token'] = session.user.JellyfinSession?.AccessToken;
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

export function useMutationBlobHandler<TPayload, TResponse>(
  props: UseMutationBlobHandlerProps<TPayload, TResponse>
) {
  const {
    mutationKey,
    endpoint,
    requiresAuth = true,
    invalidateQueryKeys = [],
    method = 'POST'
  } = props;

  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [mutationKey],
    mutationFn: async (payload: TPayload) => {
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      };

      if (requiresAuth) {
        if (!session?.user?.JellyfinSession?.AccessToken) {
          throw new Error('Authentication required but no token available');
        }
        headers['x-access-token'] = session.user.JellyfinSession.AccessToken;
      }

      const res = await fetch(`/api/${endpoint}`, {
        method,
        headers,
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error(`Failed to ${method} ${endpoint}`);
      }

      // Handle as blob for download
      const blob = await res.blob();

      // Try to get filename from headers (fallback to payload name)
      const disposition = res.headers.get('Content-Disposition');
      let filename = (payload as any).JellyfinUser || 'download.m3u';
      if (disposition?.includes('filename=')) {
        const match = disposition.match(/filename="?(.+?)"?$/);
        if (match) filename = match[1];
      }

      // Trigger download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(url);

      return {}; // Optional: return something if you need
    },
    onSuccess: () => {
      invalidateQueryKeys.forEach((key) => queryClient.invalidateQueries({ queryKey: [key] }));
    }
  });
}
