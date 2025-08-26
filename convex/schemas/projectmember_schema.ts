import { defineTable } from "convex/server";
import { v } from "convex/values";

// ---------- Shared enums ----------
export const memberStatusEnum = v.union(
  v.literal("active"),
  v.literal("on_hold"),
  v.literal("left")
);

// TypeScript helper type matching memberStatusEnum
export type MemberStatus = "active" | "on_hold" | "left";

export const memberAuthRoleEnum = v.union(
  v.literal("owner"),
  v.literal("admin"),
  v.literal("member"),
  v.literal("viewer")
);

// ---------- Project Members ----------
export const projectMemberSchema = {
  projectId: v.id("projects"),
  userId: v.id("users"),

  // Authorization role on the project
  authRole: memberAuthRoleEnum,

  // Current lifecycle snapshot
  status: memberStatusEnum,
  statusNote: v.optional(v.string()),
  expectedReturnAt: v.optional(v.number()), // only meaningful when status === "on_hold"

  // Timestamps
  joinedAt: v.number(),
  leftAt: v.optional(v.number()),
  createdAt: v.number(),
  updatedAt: v.number(),

  // Optional display/role info
  role: v.optional(v.string()),
  memberTitle: v.optional(v.string()),
  titleDescription: v.optional(v.string()),

  // Optional fine-grained overrides
  grants: v.optional(v.array(v.string())),
  revokes: v.optional(v.array(v.string())),
};

export const projectMembersTable = defineTable(projectMemberSchema)
  .index("by_project", ["projectId"]) // list members for a project
  .index("by_user", ["userId"]) // list projects for a user
  .index("by_project_user", ["projectId", "userId"]); // ensure fast lookup/uniqueness management

// ---------- Status Change History ----------
// Immutable audit trail of membership status transitions in strict order
export const projectMemberStatusHistorySchema = {
  projectId: v.id("projects"),
  projectMemberId: v.id("projectMembers"),
  userId: v.id("users"), // the member

  // Status transition
  fromStatus: memberStatusEnum,
  toStatus: memberStatusEnum,
  reason: v.optional(v.string()),
  expectedReturnAt: v.optional(v.number()), // only when toStatus === "on_hold"

  // Monotonic sequence per member to preserve order
  sequence: v.number(),

  // Who performed the change and when
  changedByUserId: v.id("users"),
  changedAt: v.number(),
  createdAt: v.number(),
};

export const projectMemberStatusHistoryTable = defineTable(
  projectMemberStatusHistorySchema
)
  .index("by_member_sequence", ["projectMemberId", "sequence"]) // paginate history in order
  .index("by_member_time", ["projectMemberId", "changedAt"]) // alternate read pattern
  .index("by_project", ["projectId"]);

// ---------- Args/validators used by mutations ----------
export const memberStatusChangeArgs = {
  projectId: v.id("projects"),
  projectMemberId: v.id("projectMembers"),
  toStatus: memberStatusEnum,
  reason: v.optional(v.string()),
  expectedReturnAt: v.optional(v.number()), // required by UI when toStatus === "on_hold"
};

export const addMemberArgs = {
  projectId: v.id("projects"),
  userId: v.id("users"),
  authRole: memberAuthRoleEnum,
  memberTitle: v.optional(v.string()),
  titleDescription: v.optional(v.string()),
};

export type ProjectMember = typeof projectMemberSchema;
export type ProjectMemberStatusHistory =
  typeof projectMemberStatusHistorySchema;