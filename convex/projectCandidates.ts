import { mutation, action, internalAction, query } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { sendInviteEmail } from "./utils/emails";
import type { Id } from "./_generated/dataModel";
import { ConvexError, v } from "convex/values";
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

// Create a direct invite candidate and return the invite token, can be new user or existing user, if user already in the project no need to invite
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
  }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const actor = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();
    if (!actor) throw new Error("User not found");

    const now = Date.now();
    const expiresMs = (args.expiresInDays ?? 7) * 24 * 60 * 60 * 1000;

    // Normalize email (email is the primary FK)
    const normalizedEmail = args.email.toLowerCase().trim();
    
    // Check if user exists and is already a project member
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", normalizedEmail))
      .first();
    
    if (existingUser) {
      const existingMember = await ctx.db
        .query("projectMembers")
        .withIndex("by_project_user", (q) =>
          q.eq("projectId", args.projectId).eq("userId", existingUser._id)
        )
        .first();
      
      if (existingMember) {
        throw new ConvexError({ message: "User already in the project" });
      }
    }

    // Check for existing candidate by email (primary FK)
    const existing = await ctx.db
      .query("projectCandidates")
      .withIndex("by_project_email", (q) =>
        q.eq("projectId", args.projectId).eq("email", normalizedEmail)
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
      };
    }

    const inviteToken = await generateUniqueInviteToken(ctx);
    let candidateId: string;
    
    if (existing) {
      // Update existing candidate
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
      // Create new candidate with email as primary FK
      candidateId = await ctx.db.insert("projectCandidates", {
        projectId: args.projectId,
        email: normalizedEmail, // Primary FK
        source: "direct_invite" as CandidateSource,
        invitedByUserId: actor._id,
        inviteToken,
        inviteExpiresAt: now + expiresMs,
        invitationStatus: "pending",
        createdAt: now,
        updatedAt: now,
      } as any);
    }
    
    return { 
      candidateId, 
      inviteToken, 
      inviteExpiresAt: now + expiresMs,  
    };
  },
});

// Public action: create/refresh invite then send email via internal action
export const sendDirectInvite = action({
  args: {
    projectId: v.id("projects"),
    email: v.string(),
    expiresInDays: v.optional(v.number()),
    origin: v.string(),
  },
  handler: async (
    ctx,
    args
  ): Promise<{ candidateId: string; inviteToken: string; inviteExpiresAt: number }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Create or reuse invite
    const { candidateId, inviteToken, inviteExpiresAt } = await ctx.runMutation(
      api.projectCandidates.createDirectInvite,
      {
        projectId: args.projectId,
        email: args.email,
        expiresInDays: args.expiresInDays,
      }
    ).catch((err) => {
      // If it's already a ConvexError, re-throw it as-is to preserve the original message
      if (err instanceof ConvexError) {
        throw err;
      }
      // For other errors, wrap in ConvexError with the message
      throw new ConvexError(err instanceof Error ? err.message : "Failed to create invite");
    });

    // Get inviter and project for email content
    const inviter = await ctx.runQuery(api.users.getCurrentUser, {});
    const project = await ctx.runQuery(api.projects.getById, { projectId: args.projectId });
    const projectName = (project as any)?.name || "a project";
    const inviterName = inviter ? `${(inviter as any).firstName ?? ''} ${(inviter as any).lastName ?? ''}`.trim() : undefined;
    const inviteLink = `${args.origin}/invites`;

    await sendInviteEmail({
      to: args.email,
      projectName,
      inviterName,
      inviteLink,
      expiresAt: inviteExpiresAt,
    });

    return { candidateId, inviteToken, inviteExpiresAt };
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
      let user = usersMap.get(c.email as string);
      if (!user) {
        user = await ctx.db
          .query("users")
          .withIndex("by_email", (q: any) => q.eq("email", c.email))
          .first();
        if (user) usersMap.set(c.email as string, user);
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
    const normalizedEmail = me.email.toLowerCase().trim();
    
    // Get invites by email (primary FK)
    const rows = await ctx.db
      .query("projectCandidates")
      .withIndex("by_email", (q) => q.eq("email", normalizedEmail))
      .collect();

    const pending = rows.filter((r) => {
      const isPending = r.invitationStatus === "pending";
      const notExpired = !r.inviteExpiresAt || r.inviteExpiresAt > now;
      // Must match email (primary FK)
      const matches = r.email && r.email.toLowerCase().trim() === normalizedEmail;
      return isPending && notExpired && matches;
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
    
    console.log("candidate", candidate);
    // Check authorization: must match email (primary FK)
    const normalizedEmail = me.email.toLowerCase().trim();
    const isAuthorized = 
      candidate.email && candidate.email.toLowerCase().trim() === normalizedEmail;
    
    if (!isAuthorized) throw new Error("Forbidden");
    if (candidate.invitationStatus !== "pending") return { ok: true };

    const now = Date.now();
    if (args.action === "decline") {
      await ctx.db.patch(candidate._id, {
        invitationStatus: "declined",
        updatedAt: now,
      } as any);
      return { ok: true };
    }

    // Accept: mark accepted, cache userId for performance, and ensure membership exists
    const finalUserId = me._id;
    
    await ctx.db.patch(candidate._id, {
      invitationStatus: "accepted",
      appliedAt: now,
      updatedAt: now,
    } as any);

    const existingMember = await ctx.db
      .query("projectMembers")
      .withIndex("by_project_user", (q) =>
        q.eq("projectId", candidate.projectId).eq("userId", finalUserId)
      )
      .first();
    if (existingMember) return { ok: true };

    // Create membership (active) and initialize history
    const memberId = await ctx.db.insert("projectMembers", {
      projectId: candidate.projectId,
      userId: finalUserId,
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
      userId: finalUserId,
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


