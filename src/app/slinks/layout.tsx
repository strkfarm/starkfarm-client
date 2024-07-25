import { GoogleAnalytics } from '@next/third-parties/google';
import { Analytics } from '@vercel/analytics/react';
import type { Metadata } from 'next';
import React from 'react';

import '../globals.css';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="twitter:player" content="/slinks"/>
        <meta name="twitter:player:width" content="360"/>
        <meta name="twitter:player:height" content="560"/>

        <meta property="og:url" content="/slinks"/>
        <meta property="og:title" content="STRKFarm | Best Yields on Starknet"/>
        <meta property="og:description" content="Find and invest in high yield pools. STRKFarm is the best yield aggregator on Starknet."/>
        <meta property="og:image" content="https://static-assets-8zct.onrender.com/strkfarm/preview.png"/>
      </head>
      <body>
        {children}
        <Analytics />
      </body>
      <GoogleAnalytics gaId="G-K05JV94KM9" />
    </html>
  );
}
