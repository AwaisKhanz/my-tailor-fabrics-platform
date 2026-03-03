import type { Metadata } from "next";
import { Schibsted_Grotesk } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemePresetProvider } from "@/components/ThemePresetProvider";
import { Toaster } from "@/components/ui/toaster";

const schibsted = Schibsted_Grotesk({ 
  subsets: ["latin"], 
  variable: "--font-schibsted" 
});

import { siteConfig } from "@/lib/config";

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
    <html lang="en">
      <body
        className={`
          ${schibsted.variable} 
          font-schibsted
          antialiased
        `}
      >
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            disableTransitionOnChange
          >
            <ThemePresetProvider>
              {children}
              <Toaster />
            </ThemePresetProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
