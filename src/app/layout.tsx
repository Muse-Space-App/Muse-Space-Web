import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Muse Space - The Artistic Hub",
  description: "A platform for art, commissions, and creative communities.",
};

import { Suspense } from 'react';
import AppProvider from "@/providers/AppProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable} dark`}>
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
      </head>
      <body className="font-sans min-h-screen flex flex-col bg-slate-50 dark:bg-[#0c0f0f] transition-colors duration-300">
        <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
          <AppProvider>
          {children}
        </AppProvider>
        </Suspense>
      </body>
    </html>
  );
}

