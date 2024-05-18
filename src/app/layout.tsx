import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import '@rainbow-me/rainbowkit/styles.css';
import { Providers } from './providers';

import icon from './favicon.ico'

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ZERO - Dashboard",
  description: "by ZERO",
  keywords: "ZERO, Dashboard, Analytics",
  robots: "index, follow", 
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="description" content={metadata.description} />
        <meta name="keywords" content={metadata.keywords} />                
        <meta name="robots" content={metadata.robots} />
        <link rel="icon" href="/logo-zero.png" sizes="any" />
        <title>{metadata.title}</title>
      </head>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
