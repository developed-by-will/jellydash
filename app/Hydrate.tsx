'use client';

import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { StrictMode, useEffect, useState } from 'react';

export default function Hydrate({ children }: Readonly<{ children: React.ReactNode }>) {
  const [isHydrated, setIsHydrated] = useState(false);
  const [localStorageInit, setLocalStorageInit] = useState<Storage>();
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false
      }
    }
  });

  useEffect(() => {
    setIsHydrated(true);
    setLocalStorageInit(window.localStorage);
  }, []);

  return (
    <StrictMode>
      {isHydrated && (
        <PersistQueryClientProvider
          client={queryClient}
          persistOptions={{
            persister: createAsyncStoragePersister({
              storage: localStorageInit
            })
          }}
        >
          {children}
        </PersistQueryClientProvider>
      )}
    </StrictMode>
  );
}
