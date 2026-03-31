import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";
import SessionProvider from "@/components/providers/SessionProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "MythicEditz17 - Premium Scenepacks",
  description: "Premium scenepack platform for video editors",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans bg-black text-white antialiased`}>
        <SessionProvider>
          <ThemeProvider attribute="class" defaultTheme="dark">
            {children}
            <Toaster position="bottom-center" />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
