import { commonOpenGraph, commonSEO } from '@/app/commonSEO';
import { Metadata } from 'next';

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

export default function DashboardHome() {
  return (
    <div>
      <h1 className="text-xl font-bold">Welcome to Jellydash</h1>
      <p>This is your dashboard home page.</p>
    </div>
  );
}
