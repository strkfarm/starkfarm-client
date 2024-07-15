import { GoogleAnalytics } from '@next/third-parties/google';
import { Analytics } from '@vercel/analytics/react';
import type { Metadata } from 'next';
import React from 'react';

import './globals.css';

export const metadata: Metadata = {
  title: 'STRKFarm | Earn $STRK Tokens',
  description:
    'Farm on the best pools of Starknet and earn $STRK tokens. STRKFarm is the best yield aggregator on Starknet.',
  openGraph: {
    title: 'STRKFarm | Earn $STRK Tokens',
    description:
      'Farm on the best pools of Starknet and earn $STRK tokens. STRKFarm is the best yield aggregator on Starknet.',
    images: ['https://static-assets-8zct.onrender.com/strkfarm/preview.png'],
  },
  twitter: {
    creator: '@akiraonstarknet',
    title: 'STRKFarm | Earn $STRK Tokens',
    description:
      'Farm on the best pools of Starknet and earn $STRK tokens. STRKFarm is the best yield aggregator on Starknet.t',
    card: 'summary_large_image',
    images: ['https://static-assets-8zct.onrender.com/strkfarm/preview.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        {children}
        <Analytics />
      </body>
      <GoogleAnalytics gaId="G-K05JV94KM9" />
    </html>
  );
}
