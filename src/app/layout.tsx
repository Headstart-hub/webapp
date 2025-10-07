"use client";
import type { Metadata } from "next";
import { Mulish } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Authenticated, Unauthenticated } from "convex/react";
import ConvexClientProvider from "./ConvexClientProvider";
import Navbar from "@/components/ui/Navbar";
import UserSync from "@/components/UserSync";
import { PublicGuard, ProtectedGuard } from "@/components/AuthGuard";
import LandingPage from "@/components/LandingPage";
import AppThemeProvider from "@/components/AppThemeProvider";

const mulish = Mulish({
  subsets: ["latin"],
  variable: "--font-mulish",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <ConvexClientProvider>
        <html lang="en" suppressHydrationWarning>
          <body className={`${mulish.variable} font-sans antialiased`}>
            <AppThemeProvider>
              <UserSync />
              <Authenticated>
                <ProtectedGuard>{children}</ProtectedGuard>
              </Authenticated>
              <Unauthenticated>
                <PublicGuard>
                  <LandingPage />
                </PublicGuard>
              </Unauthenticated>
            </AppThemeProvider>
          </body>
        </html>
      </ConvexClientProvider>
    </ClerkProvider>
  );
}
