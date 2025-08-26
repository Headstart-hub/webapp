import { defineSchema, defineTable } from "convex/server";
import { userTable } from "./schemas/user_schema";
import { projectTable } from "./schemas/project_schema";
import {
  projectMembersTable,
  projectMemberStatusHistoryTable,
} from "./schemas/projectmember_schema";
import {
  projectCandidatesTable,
  projectRecruitmentStatusesTable,
} from "./schemas/projectCandidate_schema";

export default defineSchema({
  users: userTable,
  // ---------- Projects ----------
  projects: projectTable,
  // ---------- Project Members ----------
  projectMembers: projectMembersTable,
  projectMemberStatusHistory: projectMemberStatusHistoryTable,
  // ---------- Project Candidates ----------
  projectCandidates: projectCandidatesTable,
  projectRecruitmentStatuses: projectRecruitmentStatusesTable,
});
