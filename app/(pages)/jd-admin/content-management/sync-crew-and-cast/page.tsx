import { commonOpenGraph, commonSEO } from '@/app/commonSEO';
import { Metadata } from 'next';
import Component from '.';

export async function generateMetadata(): Promise<Metadata> {
  const title = 'Jellydash - Sync Crew & Cast';

  return {
    title,
    ...commonSEO,
    openGraph: {
      title,
      ...commonOpenGraph
    }
  };
}

export default async function Index() {
  return <Component />;
}
