import type { Metadata } from "next";
import { Schibsted_Grotesk } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
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
          
          /* --- FONT SELECTION --- */
          /* Options: font-public, font-figtree, font-instrument, font-schibsted, font-inter */
          
          font-public
          /* font-figtree */
          /* font-instrument */
          /* font-schibsted */
          /* font-inter */
          
          antialiased
        `}
      >
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
