'use client';

import { signOut, useSession } from 'next-auth/react';

export default function Dashboard() {
  const { data: session } = useSession();

  if (!session) return null;

  const userInfo = session.user.SessionInfo;

  return (
    <div>
      <h1>Welcome, {userInfo?.UserName}</h1>
      <button onClick={() => signOut({ callbackUrl: '/login' })}>Logout</button>
    </div>
  );
}
