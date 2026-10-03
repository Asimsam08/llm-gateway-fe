import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { NavigationProvider } from "@/context/NavigationContext";
import { PdfChatProvider } from "@/context/PdfChatContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | LLM Gateway",
    default: "LLM Gateway - Intelligent Multi-Model Orchestration",
  },
  description: "Enterprise gateway for LLM orchestration, token budget management, retries, and conversational context.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="h-full bg-[#090a0f] text-zinc-100 selection:bg-indigo-500/30 selection:text-indigo-200 antialiased overflow-hidden">
        <AuthProvider>
          <NavigationProvider>
            <PdfChatProvider>{children}</PdfChatProvider>
          </NavigationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
