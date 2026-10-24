import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { SidebarProvider } from '@/components/layout/SidebarContext';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#020617' },
  ],
};

export const metadata: Metadata = {
  title: 'Rajasthan Suchna · Admin Console',
  description: 'Editorial recruitment publishing center for Rajasthan Suchna mobile application.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className="min-h-screen antialiased bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200"
      >
        <ThemeProvider>
          <SidebarProvider>
            {children}
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
