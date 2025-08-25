"use client";

import { AppShell } from "@/components/app-shell";
import { ProtectedGuard } from "@/components/AuthGuard";

export default function ProjectsPage() {
  return (
    <ProtectedGuard>
      <AppShell currentPage="projects">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-2xl font-bold mb-4">My Projects</h1>
          <p className="text-gray-600">Your projects will appear here.</p>
        </div>
      </AppShell>
    </ProtectedGuard>
  );
}
