import type { Metadata } from "next";
// import { Inter, Courier_Prime } from "next/font/google";
import "./globals.css";

// const courier = Courier_Prime({
//   weight: '400',
//   subsets: ['latin']
// });

export const metadata: Metadata = {
  title: "Zk-Farmers | Farm on the best pools of Starknet",
  description: "Farm on the best pools of Starknet",
}; 

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
  </html>
  );
}
