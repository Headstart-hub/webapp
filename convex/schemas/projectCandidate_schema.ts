import { defineTable } from "convex/server";
import { v } from "convex/values";

// ---------- Enums / helpers ----------
export const candidateSourceEnum = v.union(
  v.literal("application"), // user applied themselves
  v.literal("direct_invite"), // project invited user; accepts to join directly
  v.literal("referral_invite") // project invited via referral; user must apply
);

export type CandidateSource = "application" | "direct_invite" | "referral_invite";

// ---------- Recruitment Status taxonomy ----------
export const recruitmentStatusSchema = {
  description: v.string(), // e.g., "Applied", "Shortlisted", "Interviewing", "Accepted", "Rejected"
  sequence: v.number(), // ordering for UI and pipelines
  createdAt: v.number(),
};

export const projectRecruitmentStatusesTable = defineTable(
  recruitmentStatusSchema
)
  .index("by_description", ["description"]) // quick lookup
  .index("by_sequence", ["sequence"]);

// ---------- Project Candidates (User ↔ Project applications / invites) ----------
export const projectCandidateSchema = {
  projectId: v.id("projects"),
  userId: v.id("users"),

  // Provenance of the candidate row
  source: candidateSourceEnum,
  referralByUserId: v.optional(v.id("users")), // when source === "referral_invite"
  invitedByUserId: v.optional(v.id("users")), // when source === "direct_invite" or "referral_invite"

  // Invite flow (optional)
  inviteToken: v.optional(v.string()),
  inviteExpiresAt: v.optional(v.number()),
  invitationStatus: v.optional(
    v.union(v.literal("pending"), v.literal("accepted"), v.literal("declined"))
  ),

  // Application fields
  appliedAt: v.optional(v.number()), // set on application or after accepting referral invite
  coverLetter: v.optional(v.string()),

  // Statusing against taxonomy
  recruitmentStatusId: v.optional(v.id("projectRecruitmentStatuses")),

  // Timestamps
  createdAt: v.number(),
  updatedAt: v.number(),
};

export const projectCandidatesTable = defineTable(projectCandidateSchema)
  .index("by_project", ["projectId"]) // list candidates by project
  .index("by_user", ["userId"]) // list a user's candidacies
  .index("by_status", ["recruitmentStatusId"]) // stage filtering
  .index("by_project_user", ["projectId", "userId"]) // uniqueness enforcement
  .index("by_applied_at", ["appliedAt"]) // application time
  .index("by_invite_token", ["inviteToken"]); // ensure inviteToken lookups/uniqueness

// ---------- Args/validators for mutations ----------
export const candidateCreateArgs = {
  projectId: v.id("projects"),
  userId: v.id("users"),
  source: candidateSourceEnum,
  coverLetter: v.optional(v.string()),
  referralByUserId: v.optional(v.id("users")),
};

export const candidateUpdateStatusArgs = {
  candidateId: v.id("projectCandidates"),
  recruitmentStatusId: v.id("projectRecruitmentStatuses"),
};

export const candidateAcceptInviteArgs = {
  projectId: v.id("projects"),
  inviteToken: v.string(),
};

export type ProjectCandidate = typeof projectCandidateSchema;
export type ProjectRecruitmentStatus = typeof recruitmentStatusSchema;