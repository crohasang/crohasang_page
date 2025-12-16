import type { Metadata } from 'next';
import Script from 'next/script';
import localFont from 'next/font/local';
import './globals.css';
import Header from '@/components/Header';

const crohasangLogoUrl = 'https://d1faf0kcj4x8qr.cloudfront.net/logo/crohasang_logo.png';
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

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
      <head>
        {GA_ID ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-gtag" strategy="afterInteractive">
              {`window.dataLayer = window.dataLayer || [];
              function gtag(){window.dataLayer.push(arguments);}
              gtag('js', new Date());

              gtag('config', '${GA_ID}');`}
            </Script>
          </>
        ) : null}
      </head>
      <body className={pretendard.className}>
        <Header hideOnHome={true} />
        {children}
      </body>
    </html>
  );
}
