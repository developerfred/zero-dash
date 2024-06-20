


import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import '@rainbow-me/rainbowkit/styles.css';
import { Providers } from './providers';
import ErrorBoundary from '@/components/ErrorBoundary';

import icon from './favicon.ico';

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
        <link rel="icon" href="/logo-zero.png" sizes="any" />        
      </head>
      <body className={inter.className} suppressHydrationWarning={true}>        
          <ErrorBoundary>{children}
          </ErrorBoundary>        
      </body>
    </html>
  );
}
