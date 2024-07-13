import type { Metadata } from 'next';
import localFont from 'next/font/local';
import Header from '../components/common/Header';
import PageTransition from '@/components/common/PageTransition';
import './globals.css';

import crohasangLogo from '../../public/image/logo/crohasang_logo.png';

const pretendard = localFont({
  src: '../../public/fonts/PretendardVariable.woff2',
  display: 'swap',
  weight: '45 920',
  variable: '--font-pretendard',
});

export const metadata: Metadata = {
  title: 'crohasang',
  description: 'page that introduce crohasang',
  icons: [
    {
      rel: 'icon',
      url: crohasangLogo.src,
      type: 'image/png',
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="kr" className={`${pretendard.variable}`}>
      <body className={pretendard.className}>
        <Header />
        <PageTransition>{children}</PageTransition>
      </body>
    </html>
  );
}
