import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ThemeProvider } from "next-themes";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GymPal — Your London Fitness Companion",
  description: "Discover exercises, find nearby gyms, explore parks, and plan bike routes across London.",
};

export const viewport: Viewport = {
  themeColor: "#000000",
  viewportFit: "cover",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col antialiased">
        <ThemeProvider attribute="data-theme" defaultTheme="dark" enableSystem={false}>
          <a href="#main-content" className="skip-link">Skip to content</a>
          <div className="theme-control fixed right-4 top-4 z-50 rounded-xl md:hidden">
            <ThemeToggle />
          </div>
          <Navbar />
          <main id="main-content" className="flex-1 flex flex-col pb-safe-nav md:pb-0">{children}</main>
          <BottomNav />
        </ThemeProvider>
      </body>
    </html>
  );
}
