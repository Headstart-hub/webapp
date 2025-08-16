"use client";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Authenticated, Unauthenticated } from "convex/react";
import ConvexClientProvider from "./ConvexClientProvider";
import Navbar from "@/components/ui/Navbar";
import UserSync from "@/components/UserSync";
import { PublicGuard, ProtectedGuard } from "@/components/AuthGuard";
import LandingPage from "@/components/LandingPage";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <ConvexClientProvider>
        <html lang="en">
          <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased`}
          >
            <UserSync />
            <Navbar />
            <Authenticated>
              <ProtectedGuard>{children}</ProtectedGuard>
            </Authenticated>
            <Unauthenticated>
              <PublicGuard>
                <LandingPage />
              </PublicGuard>
            </Unauthenticated>
          </body>
        </html>
      </ConvexClientProvider>
    </ClerkProvider>
  );
}
