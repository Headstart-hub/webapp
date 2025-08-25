"use client";

import { ReactNode, useCallback, useState } from "react";
import { LeftNav } from "@/components/ui/left-nav";
import { View } from "@/types/navigation";

interface AppShellProps {
  children: ReactNode;
  currentPage?: string;
}

export function AppShell({ children, currentPage = "Home" }: AppShellProps) {
  const [currentView, setCurrentView] = useState<string>(currentPage);
  const handleViewChange = useCallback((view: View) => {
    setCurrentView(view);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto w-full max-w-7xl px-4 md:px-6 py-6 grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-3">
          <LeftNav currentView={currentPage} onViewChange={handleViewChange} />
        </div>
        <div className="md:col-span-9">{children}</div>
      </div>
    </div>
  );
}
