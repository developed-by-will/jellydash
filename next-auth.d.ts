// types/next-auth.d.ts
import { LoginResponseTypeExtended } from '@/app/@types';
import 'next-auth';

declare module 'next-auth' {
  interface User extends Partial<LoginResponseTypeExtended> {
    jellyfinToken: string;
  }

  interface Session {
    user: {
      jellyfinToken: string;
      SessionInfo?: LoginResponseTypeExtended['SessionInfo'];
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    jellyfinToken: string;
    SessionInfo?: LoginResponseTypeExtended['SessionInfo'];
  }
}
