import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";
import SessionProvider from "@/components/providers/SessionProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "MythicEditz17 - Premium Scenepacks",
  description: "Premium scenepack platform for video editors. Download high-quality scenepacks for your edits.",
  keywords: ["scenepacks", "video editing", "anime edits", "gaming edits", "VFX"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans bg-[#030014] text-white antialiased`}>
        {/* Cosmic Background */}
        <div className="cosmic-bg" />
        <div className="stars" />
        <div className="nebula-glow nebula-1" />
        <div className="nebula-glow nebula-2" />
        
        <SessionProvider>
          <ThemeProvider attribute="class" defaultTheme="dark">
            {children}
            <Toaster 
              position="bottom-center" 
              toastOptions={{
                style: {
                  background: 'rgba(15, 10, 40, 0.9)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#fff',
                },
              }}
            />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
