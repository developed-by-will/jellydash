import { commonOpenGraph, commonSEO } from '@/app/commonSEO';
import { Metadata } from 'next';
import Component from '.';

export async function generateMetadata(): Promise<Metadata> {
  const title = 'Jellydash - Manage User Roles';

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
