import type { Metadata } from "next";
import { Manrope } from "next/font/google";
// import { Manrope } from "next/font/google";
// import { Sora } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemePresetProvider } from "@/components/ThemePresetProvider";
import { Toaster } from "@/components/ui/toaster";

// const appFont = Plus_Jakarta_Sans({
//   subsets: ["latin"],
//   weight: ["400", "500", "600", "700", "800"],
//   display: "swap",
//   variable: "--font-schibsted",
//   fallback: ["system-ui", "-apple-system", "Segoe UI", "Arial", "sans-serif"],
// });

// Option 2 (replace `appFont` above):
const appFont = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-schibsted",
  fallback: ["system-ui", "-apple-system", "Segoe UI", "Arial", "sans-serif"],
});

// Option 3 (replace `appFont` above):
// const appFont = Sora({
//   subsets: ["latin"],
//   weight: ["400", "500", "600", "700", "800"],
//   display: "swap",
//   variable: "--font-schibsted",
//   fallback: ["system-ui", "-apple-system", "Segoe UI", "Arial", "sans-serif"],
// });

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
    <html lang="en" suppressHydrationWarning>
      <body
        className={`
          ${appFont.variable} 
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
