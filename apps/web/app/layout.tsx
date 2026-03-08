import type { Metadata } from "next";
import localFont from "next/font/local";
import { cookies } from "next/headers";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";

import { siteConfig } from "@/lib/config";
import {
  THEME_COOKIE_KEY,
  THEME_STORAGE_KEY,
  type AppTheme,
} from "@/lib/theme";

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const cookieTheme = cookieStore.get(THEME_COOKIE_KEY)?.value;
  const serverTheme: AppTheme | null =
    cookieTheme === "dark" || cookieTheme === "light" ? cookieTheme : null;

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={serverTheme === "dark" ? "dark" : undefined}
      style={serverTheme ? { colorScheme: serverTheme } : undefined}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(() => {
              try {
                const stored = window.localStorage.getItem("${THEME_STORAGE_KEY}");
                const resolved = stored === "light" || stored === "dark"
                  ? stored
                  : (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
                document.documentElement.classList.toggle("dark", resolved === "dark");
                document.documentElement.style.colorScheme = resolved;
                document.cookie = "${THEME_COOKIE_KEY}=" + resolved + "; path=/; max-age=31536000; samesite=lax";
              } catch {}
            })();`,
          }}
        />
      </head>
      <body
        suppressHydrationWarning
        className={`${inter.variable} ${inter.className} min-h-screen bg-background text-foreground antialiased`}
      >
        <AuthProvider>
          <ThemeProvider initialTheme={serverTheme ?? undefined}>
            {children}
            <Toaster />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
