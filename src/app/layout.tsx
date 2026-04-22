import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/sidebar";
import { AppProvider } from "@/lib/context";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BNI Sökningar",
  description: "Veckans sökningar - BNI Companion App",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sv" className={`${inter.variable} h-full antialiased`}>
      <head>
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link
          href="https://api.fontshare.com/v2/css?f[]=satoshi@700,500,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full bg-background font-sans">
        <AppProvider>
          <Sidebar />
          <main className="ml-64 min-h-screen">{children}</main>
        </AppProvider>
      </body>
    </html>
  );
}
