import type { Metadata } from "next";
import localFont from "next/font/local";
import "@tbms/ui/globals.css";
import AuthProvider from "@/components/AuthProvider";
import { QueryProvider } from "@/components/QueryProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@tbms/ui/components/sonner";

import { siteConfig } from "@/lib/config";

const inter = localFont({
  src: [
    {
      path: "./fonts/GeistVF.woff",
      style: "normal",
      weight: "100 900",
    },
  ],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: `${siteConfig.name} - ${siteConfig.description}`,
  description: siteConfig.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${inter.variable} ${inter.className} min-h-screen bg-background text-foreground antialiased`}
      >
        <AuthProvider>
          <QueryProvider>
            <ThemeProvider>
              {children}
              <Toaster />
            </ThemeProvider>
          </QueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
