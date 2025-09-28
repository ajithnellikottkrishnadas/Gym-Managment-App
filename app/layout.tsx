import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Inter } from "next/font/google";
import "../styles/globals.css";
import "./globals.css";
import ThemeProvider from "@/utils/ThemeProvider";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "My Gym App",
  description: "PWA Gym Management App",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.className} antialiased bg-gray-200 text-gray-900 dark:bg-black dark:text-gray-100`}
      >
        {/* ✅ Move ThemeProvider INSIDE body, not outside */}
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false} // disable auto system theme if you want light as default
          forcedTheme="light"
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
