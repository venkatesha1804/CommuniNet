import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { Toaster } from "sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CommuNet Community Platform",
  description: "A Trusted Digital Platform for CommuNet Community Growth",
};

import { Chatbot } from "@/components/support/chatbot";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        <AuthProvider>
          {children}
          <Chatbot />
          <Toaster richColors position="top-right" />
        </AuthProvider>
      </body>
    </html>
  );
}
