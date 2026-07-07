import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';

export const metadata: Metadata = {
  title: 'Q-sort 测评 | 关系中的自我探索',
  description: '通过互动式 Q-sort 测评，探索你在关系中的边界感、讨好倾向和自我位置。仅供自我反思，非临床诊断。',
  keywords: ['Q-sort', '心理学', '边界感', '讨好', '自我探索', '关系'],
  authors: [{ name: 'Q-sort Research Tool' }],
  robots: 'index, follow',
  openGraph: {
    title: 'Q-sort 测评 | 关系中的自我探索',
    description: '通过互动式 Q-sort 测评，探索你在关系中的边界感和自我位置。',
    type: 'website',
    locale: 'zh_CN',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f8fafc' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen antialiased">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}