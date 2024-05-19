/* eslint-disable @next/next/no-page-custom-font */
import { Analytics } from '@vercel/analytics/react';
import type { Metadata } from 'next';
// import { Inter, Courier_Prime } from "next/font/google";
import { GoogleAnalytics } from '@next/third-parties/google';
import React from 'react';
import './globals.css';

// const courier = Courier_Prime({
//   weight: '400',
//   subsets: ['latin']
// });

export const metadata: Metadata = {
  title: 'STRKFarm | Earn $STRK Tokens',
  description: 'Farm on the best pools of Starknet',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" href="/favicon.png" />
      </head>
      <body>
        {children}
        <Analytics />
      </body>
      <GoogleAnalytics gaId="G-K05JV94KM9" />
    </html>
  );
}
