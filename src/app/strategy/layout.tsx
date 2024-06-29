import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Strategies | STRKFarm',
  description:
    'Strategies are combination of deposit & borrow actions that combine various pools and risk combinations to maximize yield. We currently have one High yield low risk strategy, and adding more as you read this.',
};

export default function StrategiesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
