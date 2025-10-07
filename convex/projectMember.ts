import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import {
  addMemberArgs,
  memberStatusChangeArgs,
  MemberStatus,
} from "./schemas/projectmember_schema";

// Add a user as a project member and initialize status/history
export const addMember = mutation({
  args: addMemberArgs,
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const actor = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();
    if (!actor) throw new Error("User not found");

    const now = Date.now();

    // Ensure no duplicate membership
    const existing = await ctx.db
      .query("projectMembers")
      .withIndex("by_project_user", (q) =>
        q.eq("projectId", args.projectId).eq("userId", args.userId)
      )
      .first();
    if (existing) return existing._id;

    const memberId = await ctx.db.insert("projectMembers", {
      projectId: args.projectId,
      userId: args.userId,
      authRole: args.authRole,
      status: "active",
      statusNote: undefined,
      expectedReturnAt: undefined,
      joinedAt: now,
      leftAt: undefined,
      createdAt: now,
      updatedAt: now,
      role: undefined,
      memberTitle: args.memberTitle,
      titleDescription: args.titleDescription,
      grants: undefined,
      revokes: undefined,
    });

    // Initialize history with sequence 1
    await ctx.db.insert("projectMemberStatusHistory", {
      projectId: args.projectId,
      projectMemberId: memberId,
      userId: args.userId,
      fromStatus: "active",
      toStatus: "active",
      reason: "joined",
      expectedReturnAt: undefined,
      sequence: 1,
      changedByUserId: actor._id,
      changedAt: now,
      createdAt: now,
    });

    return memberId;
  },
});

// Change member status with an atomic snapshot update + history append
export const changeMemberStatus = mutation({
  args: memberStatusChangeArgs,
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const actor = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();
    if (!actor) throw new Error("User not found");

    const member = await ctx.db.get(args.projectMemberId);
    if (!member) throw new Error("Member not found");
    if (member.projectId !== args.projectId)
      throw new Error("Member does not belong to project");

    if (args.toStatus === "on_hold" && !args.expectedReturnAt) {
      throw new Error("expectedReturnAt required when placing member on hold");
    }

    const last = await ctx.db
      .query("projectMemberStatusHistory")
      .withIndex("by_member_sequence", (q) =>
        q.eq("projectMemberId", args.projectMemberId)
      )
      .order("desc")
      .first();

    const nextSeq = (last?.sequence ?? 1) + 1;
    const now = Date.now();

    await ctx.db.insert("projectMemberStatusHistory", {
      projectId: member.projectId,
      projectMemberId: member._id,
      userId: member.userId,
      fromStatus: member.status as MemberStatus,
      toStatus: args.toStatus,
      reason: args.reason,
      expectedReturnAt: args.toStatus === "on_hold" ? args.expectedReturnAt : undefined,
      sequence: nextSeq,
      changedByUserId: actor._id,
      changedAt: now,
      createdAt: now,
    });

    await ctx.db.patch(member._id, {
      status: args.toStatus,
      statusNote: args.reason,
      expectedReturnAt:
        args.toStatus === "on_hold" ? args.expectedReturnAt : undefined,
      leftAt: args.toStatus === "left" ? now : undefined,
      updatedAt: now,
    });

    return { ok: true };
  },
});

// Convenience query: list current members for a project
export const listMembersByProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("projectMembers")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();
  },
});

