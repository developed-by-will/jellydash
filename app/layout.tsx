import { Toaster } from '@/components/breeze-ui/toast/toaster';
import './globals.css';
import Hydrate from './Hydrate';

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Hydrate>{children}</Hydrate>
        <Toaster />
      </body>
    </html>
  );
}
