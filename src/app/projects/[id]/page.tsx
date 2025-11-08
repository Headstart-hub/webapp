"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAction, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { AppShell } from "@/components/app-shell";
import { ProtectedGuard } from "@/components/AuthGuard";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { InviteUserModal } from "../InviteUserModal";
import { ArrowLeft } from "lucide-react";

type ProjectOwnerLite = {
  _id: Id<"users">;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string | null;
} | null;

type ProjectDetail = {
  _id: Id<"projects">;
  name: string;
  description?: string | null;
  status: string;
  teamMemberCount: number;
  createdAt: number;
  updatedAt: number;
  owner: ProjectOwnerLite;
} | null;

type CandidateWithUser = {
  _id: Id<"projectCandidates">;
  source?: string;
  invitationStatus?: "pending" | "accepted" | "declined";
  email: string;
  user: (
    | {
        _id: Id<"users">;
        firstName: string | null;
        lastName: string | null;
        imageUrl: string | null;
        email: string | null;
      }
    | null
  );
};

type MemberWithUser = {
  _id: Id<"projectMembers">;
  user: (
    | {
        _id: Id<"users">;
        firstName: string | null;
        lastName: string | null;
        imageUrl: string | null;
      }
    | null
  );
};

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const projectId = (params?.id as string | undefined) as Id<"projects"> | undefined;

  const project = useQuery(api.projects.getById, projectId ? { projectId } : "skip") as ProjectDetail;
  const candidates = useQuery(
    api.projectCandidates.listByProjectWithUsers,
    projectId ? { projectId } : "skip"
  );
  const members = useQuery(
    api.projectMember.listByProjectWithUsers,
    projectId ? { projectId } : "skip"
  ) as Array<MemberWithUser> | undefined;
  const [showInviteModal, setShowInviteModal] = useState(false);
  async function onInviteClick() {
    setShowInviteModal(true);
  }


  const formattedDates = useMemo(() => {
    if (!project) return null;
    return {
      created: new Date(project.createdAt).toLocaleString(),
      updated: new Date(project.updatedAt).toLocaleString(),
    };
  }, [project]);

  return (
    <ProtectedGuard>
      <AppShell currentPage="projects">
        {!project ? (
          <div className="text-sm text-gray-500 mt-4">Loading project…</div>
        ) : (
          <div className="space-y-4">
            <Card className="rounded-xl">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <div className="mb-2">
                      <Button variant="ghost" size="sm" className="px-2" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Back
                      </Button>
                    </div>
                    <div className="text-xl font-semibold">{project.name}</div>
                    {project.description ? (
                      <div className="text-sm text-black/60 mt-1">{project.description}</div>
                    ) : null}
                    {members ? (
                      <div className="mt-3 flex -space-x-2">
                        {members.map((m) => (
                          <Avatar key={String(m._id)} className="h-6 w-6 ring-2 ring-white">
                            <AvatarImage src={m.user?.imageUrl ?? undefined} alt="" />
                            <AvatarFallback>
                              {String(m.user?.firstName ?? "").slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                      </div>
                    ) : null}
                    <div className="mt-2 text-xs text-black/60">
                      Created {formattedDates?.created}
                    </div>
                  </div>
                  <div className="ml-4">
                    <Button onClick={onInviteClick}>
                      Invite User
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-xl">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-base font-semibold">Invited users</div>
                      <div className="text-xs text-black/60">
                    {Array.isArray(candidates) ? candidates.filter((c) => (c as CandidateWithUser).source !== "application").length : 0}
                  </div>
                </div>
                {!candidates ? (
                  <div className="text-sm text-gray-500">Loading invites…</div>
                ) : (
                  <div className="space-y-3">
                    {candidates
                      .filter((c) => (c as CandidateWithUser).source !== "application")
                      .map((c) => {
                        const cand = c as CandidateWithUser
                        return (
                        <div key={String(c._id)} className="flex items-center justify-between">
                          <div className="flex items-center gap-3 min-w-0">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={cand.user?.imageUrl ?? undefined} alt="" />
                              <AvatarFallback>
                                {cand.user 
                                  ? String(cand.user.firstName ?? "").slice(0, 2).toUpperCase()
                                  : cand.email 
                                    ? cand.email.slice(0, 2).toUpperCase()
                                    : "??"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <div className="text-sm font-medium truncate">
                                {cand.user 
                                  ? `${cand.user.firstName} ${cand.user.lastName}` 
                                  : "Invited user"}
                              </div>
                              <div className="text-xs text-black/60 truncate">
                                {cand.user?.email ?? cand.email}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {cand.invitationStatus ? (
                              <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs border">
                                {cand.invitationStatus}
                              </span>
                            ) : null}
                          </div>
                        </div>
                      )})}
                    {candidates.filter((c) => (c as CandidateWithUser).source !== "application").length === 0 ? (
                      <div className="text-sm text-gray-500">No invites yet.</div>
                    ) : null}
                  </div>
                )}
              </CardContent>
            </Card>
            {showInviteModal && projectId ? (
              <InviteUserModal
                open={showInviteModal}
                onClose={() => setShowInviteModal(false)}
                projectId={projectId}
              />
            ) : null}
          </div>
        )}
      </AppShell>
    </ProtectedGuard>
  );
}


