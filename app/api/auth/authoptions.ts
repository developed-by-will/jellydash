import { LoginPayloadType } from '@/app/(pages)/login/formValidations';
import { AuthenticateByNameResponse } from '@/app/@types';
import { ANONYMOUS_POST } from '@/app/utils/requestHandler';
import { NextAuthOptions, User } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

if (!process.env.NEXTAUTH_SECRET || !process.env.NEXTAUTH_URL) {
  throw new Error('NEXTAUTH_SECRET or NEXTAUTH_URL is not defined');
}

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET;
const NEXTAUTH_URL = process.env.NEXTAUTH_URL;

export const authOptions: NextAuthOptions = {
  secret: NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt'
  },
  providers: [
    CredentialsProvider({
      name: 'Jellyfin',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        const authResponse = await ANONYMOUS_POST<LoginPayloadType, AuthenticateByNameResponse>(
          `${NEXTAUTH_URL}/api/users/authenticate-by-name`,
          {
            Username: credentials.username,
            Pw: credentials.password
          }
        );

        return {
          JellyfinSession: authResponse
        } as User;
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.JellyfinSession = user.JellyfinSession;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.JellyfinSession = token.JellyfinSession;
      return session;
    }
  },
  pages: {
    signIn: '/(pages)/login'
  }
};
