import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import Header from '@/components/Header';

const crohasangLogoUrl = 'https://d1faf0kcj4x8qr.cloudfront.net/logo/crohasang_logo.png';

const pretendard = localFont({
  src: '../../public/fonts/PretendardVariable.woff2',
  display: 'swap',
  weight: '45 920',
  variable: '--font-pretendard',
});

export const metadata: Metadata = {
  title: 'crohasang',
  description: 'Personal website of crohasang',
  icons: [
    {
      rel: 'icon',
      url: crohasangLogoUrl,
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
        <Header hideOnHome={true} />
        {children}
      </body>
    </html>
  );
}
