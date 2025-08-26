"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { ProtectedGuard } from "@/components/AuthGuard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Filter, Grid3X3, List, Rocket, Plus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { NewProjectModal } from "./NewProjectModal";

export default function ProjectsPage() {
  const COLORS = { primary: "#6366f1", fg: "#111827", border: "#e5e7eb" };

  const statusOptions = ["All", "Active", "Paused", "Completed"] as const;
  const [filter, setFilter] = useState<{
    view: "grid" | "list";
    status: string;
  }>({ view: "grid", status: "all" });

  const projects = useQuery(api.projects.listMy);
  const filtered = useMemo(() => {
    if (!projects) return projects;
    if (filter.status === "all") return projects;
    return projects.filter(
      (p: any) => (p.status || "").toLowerCase() === filter.status
    );
  }, [projects, filter]);

  const onFilterChange = (next: typeof filter) => setFilter(next);
  const [openNewProjectModal, setOpenNewProjectModal] = useState(false);

  return (
    <ProtectedGuard>
      <AppShell currentPage="projects">
        <NewProjectModal
          open={openNewProjectModal}
          onClose={() => setOpenNewProjectModal(false)}
          onCreated={() => setOpenNewProjectModal(false)}
        />
        <Card className="rounded-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Rocket className="h-5 w-5" style={{ color: COLORS.primary }} />
                <h2
                  className="text-lg font-semibold"
                  style={{ color: COLORS.fg }}
                >
                  My Projects
                </h2>
                <span className="text-sm text-black/60">
                  ({projects?.length ?? 0} projects)
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  className="h-8 px-3 text-white bg-primary-gradient hover:bg-primary-gradient-dark"
                  onClick={() => setOpenNewProjectModal(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Project
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-3"
                  style={{ borderColor: COLORS.border }}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
                <div
                  className="flex rounded-lg border"
                  style={{ borderColor: COLORS.border }}
                >
                  <Button
                    variant={filter.view === "grid" ? "default" : "ghost"}
                    size="sm"
                    className={`h-8 px-3 ${
                      filter.view === "grid"
                        ? "bg-primary-gradient text-white hover:bg-primary-gradient-dark"
                        : ""
                    }`}
                    onClick={() => onFilterChange({ ...filter, view: "grid" })}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={filter.view === "list" ? "default" : "ghost"}
                    size="sm"
                    className={`h-8 px-3 ${
                      filter.view === "list"
                        ? "bg-primary-gradient text-white hover:bg-primary-gradient-dark"
                        : ""
                    }`}
                    onClick={() => onFilterChange({ ...filter, view: "list" })}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {statusOptions.map((status) => (
                <button
                  key={status}
                  onClick={() =>
                    onFilterChange({ ...filter, status: status.toLowerCase() })
                  }
                  className={`px-3 py-1 text-sm font-medium transition rounded-lg border ${
                    filter.status === status.toLowerCase()
                      ? "bg-primary-gradient text-white hover:bg-primary-gradient-dark"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                  style={{ borderColor: COLORS.border }}
                >
                  {status}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Projects list */}
        {projects === undefined ? (
          <div className="mt-6 text-sm text-gray-500">Loading projects…</div>
        ) : (projects?.length ?? 0) === 0 ? (
          <div className="mt-6 text-sm text-gray-500">
            Start a new project now
          </div>
        ) : (
          <div
            className={
              filter.view === "grid"
                ? "mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                : "mt-6 space-y-3"
            }
          >
            {filtered!.map((p: any) => (
              <Link key={p._id} href={`/projects/${p._id}`} className="block">
                <Card className="rounded-xl hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0">
                        <div
                          className="text-base font-semibold"
                          style={{ color: COLORS.fg }}
                        >
                          {p.name}
                        </div>
                        {p.description ? (
                          <div className="text-sm text-black/60 truncate">
                            {p.description}
                          </div>
                        ) : null}
                        <div className="mt-3 flex items-center gap-3 text-sm">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage
                                src={p.owner?.imageUrl ?? undefined}
                                alt=""
                              />
                              <AvatarFallback>
                                {String(p.owner?.firstName ?? "").slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-black/70">
                              {p.owner
                                ? `${String(p.owner.firstName)} ${String(p.owner.lastName)}`
                                : "Unknown"}
                            </span>
                          </div>
                          <span
                            className="inline-flex items-center rounded-full px-2 py-0.5 text-xs border"
                            style={{ borderColor: COLORS.border }}
                          >
                            {p.status}
                          </span>
                          <span className="text-black/60">
                            Updated {new Date(p.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </AppShell>
    </ProtectedGuard>
  );
}
