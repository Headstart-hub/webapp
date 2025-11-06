"use client";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Calendar as CalendarIcon, Mail, Rocket } from "lucide-react";
import Link from "next/link";
import { ProtectedGuard } from "@/components/AuthGuard";
import { AppShell } from "@/components/app-shell";
import { COLORS } from "../signup/types";

function InviteRow({ invite }: { invite: any }) {
  const respond = useMutation(api.projectCandidates.respondToInvite);

  const onRespond = async (action: "accept" | "decline") => {
    try {
      await respond({ candidateId: invite._id, action });
    } catch (err) {
      console.error(err);
    }
  };

  const daysLeft = invite.inviteExpiresAt
    ? Math.max(0, Math.ceil((invite.inviteExpiresAt - Date.now()) / (24 * 60 * 60 * 1000)))
    : null;
  const inviter = invite.invitedByUser;

  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border p-4">
      <div className="min-w-0 flex flex-1 items-center gap-3">
        <HoverCard>


          <HoverCardTrigger asChild>
            <Avatar className="h-12 w-12 md:h-14 md:w-14 cursor-default">
              <AvatarImage src={inviter?.imageUrl ?? undefined} alt="" />
              <AvatarFallback>
                {(inviter?.firstName ?? "").slice(0, 1)}
              </AvatarFallback>
            </Avatar>

          </HoverCardTrigger>
          <HoverCardContent className="w-80">
            <div className="flex items-start gap-3">
              <Avatar>
                <AvatarImage src={inviter.imageUrl ?? undefined} alt="" />
                <AvatarFallback>
                  {(inviter.firstName ?? "").slice(0, 1)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 space-y-1">
                <h4 className="truncate text-sm font-semibold">
                  {inviter.firstName} {inviter.lastName}
                </h4>
                {inviter.email ? (
                  <div className="truncate text-xs text-gray-500">{inviter.email}</div>
                ) : null}
              </div>
            </div>
          </HoverCardContent>
        </HoverCard>

        <div className="min-w-0">
          <div className="font-medium text-gray-900 truncate">
            {inviter ? (
              <>
                <Button
                  asChild
                  variant="link"
                  className="px-0 text-indigo-600 underline decoration-dotted underline-offset-4 hover:text-indigo-700"
                  aria-label="View inviter profile"
                >
                  <Link href={inviter._id ? `/users/${inviter._id}` : "#"}>
                    {inviter.firstName} {inviter.lastName} {" "}
                  </Link>
                </Button>{' '}

                has invited you to join their project{' '}
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <Button
                      asChild
                      variant="link"
                      className="px-0 text-indigo-600 underline decoration-dotted underline-offset-4 hover:text-indigo-700"
                      aria-label="View project"
                    >
                      <Link href={invite.projectId ? `/projects/${invite.projectId}` : "#"}>
                        {invite.project?.name ?? "Project"}
                      </Link>
                    </Button>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80">
                    <div className="space-y-1">
                      <h4 className="text-sm font-semibold">{invite.project?.name ?? "Project"}</h4>
                      <p className="line-clamp-4 text-sm text-gray-600">
                        {invite.project?.description ?? "No description"}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{invite.project?.teamMemberCount ?? 0} members</span>
                      </div>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </>
            ) : (
              <>
                You have been invited to join the project{' '}
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <Button
                      asChild
                      variant="link"
                      className="px-0 text-indigo-600 underline decoration-dotted underline-offset-4 hover:text-indigo-700"
                      aria-label="View project"
                    >
                      <Link href={invite.projectId ? `/projects/${invite.projectId}` : "#"}>
                        {invite.project?.name ?? "Project"}
                      </Link>
                    </Button>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80">
                    <div className="space-y-1">
                      <h4 className="text-sm font-semibold">{invite.project?.name ?? "Project"}</h4>
                      <p className="line-clamp-4 text-sm text-gray-600">
                        {invite.project?.description ?? "No description"}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <CalendarIcon className="h-3.5 w-3.5" />
                        <span>{invite.project?.teamMemberCount ?? 0} members</span>
                      </div>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-2">
        {daysLeft !== null ? (
          <div className="text-xs text-gray-500 whitespace-nowrap">
            Expires in {daysLeft} day{daysLeft === 1 ? "" : "s"}
          </div>
        ) : null}
        <div className="flex items-center gap-2">
          <Button onClick={() => onRespond("accept")} variant="default">
            Accept
          </Button>
          <Button onClick={() => onRespond("decline")} variant="secondary">
            Decline
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function InvitesPage() {
  const invites = useQuery(api.projectCandidates.listMyPendingInvites, {}) || [];
  console.log(invites);

  return (
    <ProtectedGuard>
      <AppShell currentPage="invites">
        <Card className="rounded-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5" style={{ color: COLORS.primary }} />
              <h2
                className="text-lg font-semibold"
                style={{ color: COLORS.fg }}
              >
                My invitations
              </h2>
            </div>
            {invites.length === 0 ? (
              <div className="text-sm text-gray-500">No pending invitations.</div>
            ) : (
              <div className="space-y-3">
                {invites.map((inv: any) => (
                  <InviteRow key={inv._id} invite={inv} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </AppShell>
    </ProtectedGuard>

  );
}


