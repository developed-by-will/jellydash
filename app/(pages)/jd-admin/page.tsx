import { commonOpenGraph, commonSEO } from '@/app/commonSEO';
import { Metadata } from 'next';
import Dashboard from './layout';

export async function generateMetadata(): Promise<Metadata> {
  const title = 'Jellydash - Dashboard';

  return {
    title,
    ...commonSEO,
    openGraph: {
      title,
      ...commonOpenGraph
    }
  };
}

export default async function Index(children: React.ReactNode) {
  return <Dashboard>{children}</Dashboard>;
}
