import { defineSchema, defineTable } from "convex/server";
import { userTable } from "./schemas/user_schema";
import { projectTable } from "./schemas/project_schema";

export default defineSchema({
  users: userTable,
  // ---------- Projects ----------
  projects: projectTable,
});
