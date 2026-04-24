import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/sidebar";
import { BottomNav } from "@/components/bottom-nav";
import { AppProvider } from "@/lib/context";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BNI Sökningar",
  description: "Veckans sökningar - BNI Companion App",
  icons: {
    icon: "/bni_logo_red_rgb.jpg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sv" className={`${inter.variable} h-full antialiased`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link
          href="https://api.fontshare.com/v2/css?f[]=satoshi@700,500,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full bg-background font-sans">
        <AppProvider>
          <Sidebar />
          <main className="md:ml-64 min-h-screen pb-16 md:pb-0">{children}</main>
          <BottomNav />
        </AppProvider>
      </body>
    </html>
  );
}
