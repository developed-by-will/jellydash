import { AuthenticateByNameResponse } from '@/app/@types';
import 'next-auth';

declare module 'next-auth' {
  interface User extends Partial<AuthenticateByNameResponse> {
    JellyfinSession?: AuthenticateByNameResponse;
  }

  interface Session {
    user: {
      JellyfinSession?: AuthenticateByNameResponse;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    JellyfinSession?: AuthenticateByNameResponse;
  }
}
