import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Claim $STRK Tokens',
  description:
    'Claim your $STRK tokens from the Starknet DeFi Spring. Identify the best $STRK rewarding pools and maximize your rewards.',
};
export default function ClaimLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
