import { commonOpenGraph, commonSEO } from '@/app/commonSEO';
import { Metadata } from 'next';
import Page from '.';

export async function generateMetadata(): Promise<Metadata> {
  const title = 'Jellydash - Delete Playlist Songs';

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
  return <Page />;
}
