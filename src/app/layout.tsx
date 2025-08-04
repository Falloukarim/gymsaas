import type { Metadata, ResolvingMetadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { ThemeProvider } from 'next-themes';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EasyFit...",
  description: "Gym manager",
  manifest: "/manifest.json",
};

export async function generateViewport(metadata: ResolvingMetadata) {
  return {
    viewport: {
      width: "device-width",
      initialScale: 1,
      userScalable: true,
      themeColor: "#00c9a7", 
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className={inter.className}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        {children}
      </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
