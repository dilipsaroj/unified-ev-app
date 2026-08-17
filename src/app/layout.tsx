import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeInitializer } from '@/components/layout/ThemeInitializer';
import { BottomNav } from '@/components/layout/BottomNav';
import { ToastProvider } from '@/components/providers/ToastProvider';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Unified-EV — Every charger in India',
  description: 'Every charger in India. One app. No prepaid wallets.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Unified-EV',
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#10b981' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0b10' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} h-full`} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="font-sans h-full overflow-hidden">
        {/* Outer backdrop — visible on desktop only via padding + dark fill */}
        <div className="min-h-full bg-neutral-950 sm:flex sm:items-center sm:justify-center sm:p-6 md:p-10">
          {/*
            Phone frame — full viewport on mobile, contained on desktop.
            transform-gpu makes this the containing block for position:fixed
            descendants (BottomNav, sheets, toasts) so they stay inside the frame.
          */}
          <div
            className="
              relative isolate transform-gpu
              w-full h-[100dvh]
              sm:w-[420px] sm:h-[900px]
              sm:max-h-[calc(100dvh-3rem)]
              sm:rounded-[36px] sm:overflow-hidden
              sm:shadow-[0_30px_60px_rgba(0,0,0,0.5),0_10px_20px_rgba(0,0,0,0.3)]
              sm:ring-1 sm:ring-neutral-800
              flex flex-col
            "
            style={{ background: 'var(--color-bg)' }}
          >
            <ThemeInitializer />
            <main className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
              {children}
            </main>
            <BottomNav />
            <ToastProvider />
          </div>
        </div>
      </body>
    </html>
  );
}
