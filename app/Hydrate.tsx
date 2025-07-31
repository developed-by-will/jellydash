'use client';

import { StrictMode, useEffect, useState } from 'react';

export default function Hydrate({ children }: Readonly<{ children: React.ReactNode }>) {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return <StrictMode>{isHydrated && children}</StrictMode>;
}
