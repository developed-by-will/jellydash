import { authOptions } from '@/app/api/auth/auth';
import nextAuth from 'next-auth';

const handler = nextAuth(authOptions);

export { handler as GET, handler as POST };
