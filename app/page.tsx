import { Metadata } from 'next';
import Login from './(pages)/login/page';
import { commonOpenGraph, commonSEO } from './commonSEO';

export async function generateMetadata(): Promise<Metadata> {
  const title = 'Jellydash';

  return {
    title,
    ...commonSEO,
    openGraph: {
      title,
      ...commonOpenGraph
    }
  };
}

export default function Index() {
  return <Login />;
}
