"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Home, Flame, Rocket, Users, MessageSquare } from "lucide-react";
import { FC } from "react";
import { View } from "@/types/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface LeftNavProps {
  currentView: string;
}

export const LeftNav: FC<LeftNavProps> = ({ currentView }) => {
  const pathname = usePathname();
  const items = [
    {
      label: "Home",
      icon: Home,
      href: "/",
      active: currentView === "home" || pathname === "/",
    },
    {
      label: "Trending",
      icon: Flame,
      href: "/trending",
      active: currentView === "trending" || pathname.startsWith("/trending"),
    },
    {
      label: "My Projects",
      icon: Rocket,
      href: "/projects",
      active: currentView === "projects" || pathname.startsWith("/projects"),
    },
    {
      label: "Applications",
      icon: Users,
      href: "/applications",
      active:
        currentView === "applications" || pathname.startsWith("/applications"),
    },
    { label: "Communities", icon: Users, href: "#", active: false },
    { label: "Messages", icon: MessageSquare, href: "#", active: false },
  ];

  return (
    <Card className="rounded-2xl border border-gray-200 shadow-sm">
      <CardContent className="p-3">
        <ul className="space-y-2">
          {items.map((it) => {
            const Icon = it.icon;
            const active = it.active;
            return (
              <li key={it.label}>
                <Link
                  href={it.href}
                  className={
                    "flex w-full items-center gap-3 rounded-full px-4 py-3 text-sm transition border " +
                    (active
                      ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-transparent"
                      : "bg-transparent text-gray-800 border-gray-200 hover:bg-gray-50")
                  }
                >
                  <Icon
                    className={
                      "h-5 w-5 " + (active ? "text-white" : "text-gray-700")
                    }
                  />
                  <span>{it.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
};
