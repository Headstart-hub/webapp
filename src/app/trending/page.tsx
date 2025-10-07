"use client";

import { AppShell } from "@/components/app-shell";
import { ProtectedGuard } from "@/components/AuthGuard";

export default function TrendingPage() {
  return (
    <ProtectedGuard>
      <AppShell currentPage="trending">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-2xl font-bold mb-4">Trending</h1>
          <p className="text-gray-600">Discover what’s hot right now.</p>
        </div>
      </AppShell>
    </ProtectedGuard>
  );
}
