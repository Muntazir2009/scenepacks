import type { Metadata } from "next";
import { Inter, Cinzel } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";
import SessionProvider from "@/components/providers/SessionProvider";
import { AnnouncementBanner } from "@/components/layout/AnnouncementBanner";
import { LoadingScreen } from "@/components/ui/LoadingScreen";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "MythicEditz17 - Premium Scenepack Platform",
  description: "Cinematic scenepack sharing platform for video editors. Browse, preview, and download premium scenepacks with Drive/Mega links.",
  keywords: ["MythicEditz17", "Scenepack", "Video Editing", "Twixtor", "AMV", "Anime Edits"],
  authors: [{ name: "MythicEditz17" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "MythicEditz17 - Premium Scenepack Platform",
    description: "Cinematic scenepack sharing platform for video editors",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MythicEditz17",
    description: "Premium Scenepack Platform",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body
        className={`${inter.variable} ${cinzel.variable} font-sans antialiased bg-background text-foreground min-h-screen flex flex-col`}
      >
        <SessionProvider>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={true}>
            <LoadingScreen />
            <AnnouncementBanner />
            {children}
            <Toaster position="bottom-right" />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
