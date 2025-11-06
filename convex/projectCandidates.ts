import { mutation, action, query } from "./_generated/server";
import { api } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { v } from "convex/values";
import {
  candidateCreateArgs,
  CandidateSource,
} from "./schemas/projectCandidate_schema";

async function generateUniqueInviteToken(ctx: any): Promise<string> {
  for (let i = 0; i < 5; i++) {
    const token = `${Date.now().toString(36)}.${Math.random().toString(36).slice(2)}`;
    const exists = await ctx.db
      .query("projectCandidates")
      .withIndex("by_invite_token", (q: any) => q.eq("inviteToken", token))
      .first();
    if (!exists) return token;
  }
  throw new Error("Failed to generate unique invite token");
}

// Create a candidate entry: supports direct application, direct invite, and referral invite
export const createCandidate = mutation({
  args: candidateCreateArgs,
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const actor = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();
    if (!actor) throw new Error("User not found");

    // Prevent duplicate candidacy for the same project/user
    const existing = await ctx.db
      .query("projectCandidates")
      .withIndex("by_project_user", (q) =>
        q.eq("projectId", args.projectId).eq("userId", args.userId)
      )
      .first();
    if (existing) return existing._id;

    const now = Date.now();
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

    let candidateId: string;
    if (args.source === "application") {
      candidateId = await ctx.db.insert("projectCandidates", {
        projectId: args.projectId,
        userId: args.userId,
        source: "application" as CandidateSource,
        coverLetter: args.coverLetter,
        appliedAt: now,
        createdAt: now,
        updatedAt: now,
      } as any);
    } else if (args.source === "direct_invite") {
      candidateId = await ctx.db.insert("projectCandidates", {
        projectId: args.projectId,
        userId: args.userId,
        source: "direct_invite" as CandidateSource,
        invitedByUserId: actor._id,
        inviteToken: await generateUniqueInviteToken(ctx),
        inviteExpiresAt: now + sevenDaysMs,
        invitationStatus: "pending",
        coverLetter: args.coverLetter,
        createdAt: now,
        updatedAt: now,
      } as any);
    } else {
      if (!args.referralByUserId) {
        throw new Error("referralByUserId is required for referral_invite");
      }
      candidateId = await ctx.db.insert("projectCandidates", {
        projectId: args.projectId,
        userId: args.userId,
        source: "referral_invite" as CandidateSource,
        referralByUserId: args.referralByUserId,
        invitedByUserId: actor._id,
        inviteToken: await generateUniqueInviteToken(ctx),
        inviteExpiresAt: now + sevenDaysMs,
        invitationStatus: "pending",
        coverLetter: args.coverLetter,
        createdAt: now,
        updatedAt: now,
      } as any);
    }
    return candidateId;
  },
});

// Create a direct invite candidate and return the invite token, can be new user or existing user
export const createDirectInvite = mutation({
  args: {
    projectId: v.id("projects"),
    email: v.string(),
    expiresInDays: v.optional(v.number()),
  },
  handler: async (
    ctx,
    args
  ): Promise<{
    candidateId: string;
    inviteToken: string;
    inviteExpiresAt: number;
    userId: Id<"users">;
  }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const actor = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();
    if (!actor) throw new Error("User not found");

    const now = Date.now();

    // Resolve user by email
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
      
    if (!user) {
      throw new Error("Invitee email not found");
    }
    const userId = user._id;
    const expiresMs = (args.expiresInDays ?? 7) * 24 * 60 * 60 * 1000;

    // Check for existing candidate
    const existing = await ctx.db
      .query("projectCandidates")
      .withIndex("by_project_user", (q) =>
        q.eq("projectId", args.projectId).eq("userId", userId)
      )
      .first();

    // If an existing invite is still pending and not expired, reuse it
    if (
      existing &&
      existing.source === "direct_invite" &&
      existing.invitationStatus === "pending" &&
      existing.inviteExpiresAt &&
      existing.inviteExpiresAt > now &&
      existing.inviteToken
    ) {
      return {
        candidateId: existing._id,
        inviteToken: existing.inviteToken as string,
        inviteExpiresAt: existing.inviteExpiresAt as number,
        userId,
      };
    }

    const inviteToken = await generateUniqueInviteToken(ctx);
    let candidateId: string;
    if (existing) {
      await ctx.db.patch(existing._id, {
        source: "direct_invite" as CandidateSource,
        invitedByUserId: actor._id,
        inviteToken,
        inviteExpiresAt: now + expiresMs,
        invitationStatus: "pending",
        updatedAt: now,
      } as any);
      candidateId = existing._id;
    } else {
      candidateId = await ctx.db.insert("projectCandidates", {
        projectId: args.projectId,
        userId,
        source: "direct_invite" as CandidateSource,
        invitedByUserId: actor._id,
        inviteToken,
        inviteExpiresAt: now + expiresMs,
        invitationStatus: "pending",
        createdAt: now,
        updatedAt: now,
      } as any);
    }

    return { candidateId, inviteToken, inviteExpiresAt: now + expiresMs, userId };
  },
});

export const getCandidateByProjectId = query({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.query("projectCandidates").withIndex("by_project", (q) => q.eq("projectId", args.projectId)).collect();
  },
});

// List candidates for a project with basic user details
export const listByProjectWithUsers = query({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const candidates = await ctx.db
      .query("projectCandidates")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    // Exclude accepted; keep pending/declined/undefined
    const visible = candidates.filter((c) => c.invitationStatus !== "accepted");

    const usersMap = new Map();
    const result = [] as Array<any>;

    for (const c of visible) {
      let user = usersMap.get(c.userId as string);
      if (!user) {
        user = await ctx.db.get(c.userId);
        if (user) usersMap.set(c.userId as string, user);
      }
      result.push({
        ...c,
        user: user
          ? {
              _id: user._id,
              firstName: user.firstName,
              lastName: user.lastName,
              imageUrl: user.imageUrl,
              email: user.email,
            }
          : null,
      });
    }

    return result;
  },
});


// Count pending invites for a user (unexpired if inviteExpiresAt is set)
export const countPendingInvitesByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const now = Date.now();
    const rows = await ctx.db
      .query("projectCandidates")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    let count = 0;
    for (const r of rows) {
      const isPending = r.invitationStatus === "pending";
      const notExpired = !r.inviteExpiresAt || r.inviteExpiresAt > now;
      if (isPending && notExpired) count++;
    }
    return count;
  },
});

// List current user's pending invites with basic project info
export const listMyPendingInvites = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const me = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();
    if (!me) return [];

    const now = Date.now();
    const rows = await ctx.db
      .query("projectCandidates")
      .withIndex("by_user", (q) => q.eq("userId", me._id))
      .collect();

    const pending = rows.filter((r) => {
      const isPending = r.invitationStatus === "pending";
      const notExpired = !r.inviteExpiresAt || r.inviteExpiresAt > now;
      return isPending && notExpired;
    });

    const projectsCache = new Map<string, any>();
    const result: Array<any> = [];
    for (const c of pending) {
      const key = c.projectId as unknown as string;
      let project = projectsCache.get(key);
      if (!project) {
        project = await ctx.db.get(c.projectId);
        if (project) projectsCache.set(key, project);
      }
      const invitedByUser = c.invitedByUserId ? await ctx.db.get(c.invitedByUserId as Id<"users">) : null;
      result.push({
        _id: c._id,
        projectId: c.projectId,
        invitationStatus: c.invitationStatus,
        inviteExpiresAt: c.inviteExpiresAt,
        source: c.source,
        createdAt: c.createdAt,
        invitedByUser: c.invitedByUserId ? {
          _id: invitedByUser?._id,
          firstName: invitedByUser?.firstName,
          lastName: invitedByUser?.lastName,
          imageUrl: invitedByUser?.imageUrl,
          email: invitedByUser?.email,
        } : null,
        project: project
          ? {
              _id: project._id,
              name: project.name,
              description: project.description,
              teamMemberCount: project.teamMemberCount,
            }
          : null,
      });
    }

    return result;
  },
});

// Respond to an invite: accept or decline
export const respondToInvite = mutation({
  args: {
    candidateId: v.id("projectCandidates"),
    action: v.union(v.literal("accept"), v.literal("decline")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const me = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();
    if (!me) throw new Error("User not found");

    const candidate = await ctx.db.get(args.candidateId);
    if (!candidate) throw new Error("Invite not found");
    if (candidate.userId !== me._id) throw new Error("Forbidden");
    if (candidate.invitationStatus !== "pending") return { ok: true };

    const now = Date.now();
    if (args.action === "decline") {
      await ctx.db.patch(candidate._id, {
        invitationStatus: "declined",
        updatedAt: now,
      } as any);
      return { ok: true };
    }

    // Accept: mark accepted and ensure membership exists
    await ctx.db.patch(candidate._id, {
      invitationStatus: "accepted",
      appliedAt: now,
      updatedAt: now,
    } as any);

    

    const existingMember = await ctx.db
      .query("projectMembers")
      .withIndex("by_project_user", (q) =>
        q.eq("projectId", candidate.projectId).eq("userId", candidate.userId)
      )
      .first();
    if (existingMember) return { ok: true };

    // Create membership (active) and initialize history
    const memberId = await ctx.db.insert("projectMembers", {
      projectId: candidate.projectId,
      userId: candidate.userId,
      authRole: "member",
      status: "active",
      statusNote: undefined,
      expectedReturnAt: undefined,
      joinedAt: now,
      leftAt: undefined,
      createdAt: now,
      updatedAt: now,
      role: undefined,
      memberTitle: undefined,
      titleDescription: undefined,
      grants: undefined,
      revokes: undefined,
    } as any);

    await ctx.db.insert("projectMemberStatusHistory", {
      projectId: candidate.projectId,
      projectMemberId: memberId,
      userId: candidate.userId,
      fromStatus: "active",
      toStatus: "active",
      reason: "joined via invite acceptance",
      expectedReturnAt: undefined,
      sequence: 1,
      changedByUserId: me._id,
      changedAt: now,
      createdAt: now,
    } as any);

    return { ok: true };
  },
});


