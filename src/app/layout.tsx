import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import I18nProvider from '@/providers/I18nProvider';

export const metadata: Metadata = {
  title: 'Resume Studio',
  description: 'Create professional resumes with AI assistance.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Fonts are now self-hosted via Fontsource in globals.css */}
      </head>
      <body className="font-body antialiased">
        <I18nProvider>{children}</I18nProvider>
        <Toaster />
      </body>
    </html>
  );
}
