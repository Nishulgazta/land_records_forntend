import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/layout/app-shell";
import { SettingsProvider } from "@/components/providers/settings-provider";
import { ToastProvider } from "@/components/providers/toast-provider";

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
    default: "Bhumi — Land Intelligence",
    template: "%s · Bhumi",
  },
  description:
    "Bhumi — intelligent land record digitisation and validation workspace for cadastral parcels, document processing, validation and verification workflows.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-screen">
        <SettingsProvider>
          <ToastProvider>
            <AppShell>{children}</AppShell>
          </ToastProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
