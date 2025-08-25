"use client";

import { ReactNode, useCallback, useState } from "react";
import { LeftNav } from "@/components/ui/left-nav";
import { View } from "@/types/navigation";
import { ProfileCard } from "./ProfileCard";
import { api } from "../../convex/_generated/api";
import { useQuery } from "convex/react";

interface AppShellProps {
  children: ReactNode;
  currentPage?: string;
}

export function AppShell({ children, currentPage = "Home" }: AppShellProps) {
  const user = useQuery(api.users.getCurrentUser);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto w-full max-w-7xl px-4 md:px-6 py-6 grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-3">
          {user === undefined ? (
            <div className="mb-4">
              <div className="h-1 w-full rounded-full bg-indigo-500/70 animate-pulse" />
            </div>
          ) : user ? (
            <div className="mb-4">
              <ProfileCard user={user} />
            </div>
          ) : null}
          <LeftNav currentView={currentPage} />
        </div>
        <div className="md:col-span-9">{children}</div>
      </div>
    </div>
  );
}
