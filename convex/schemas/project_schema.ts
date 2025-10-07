import { defineTable } from "convex/server";
import { v } from "convex/values";

// ---------- Projects Validators ----------
export const projectSchema = {
  name: v.string(),
  ownerId: v.id("users"),
  description: v.optional(v.string()),
  teamMemberCount: v.number(),
  status: v.string(),
  startDate: v.optional(v.number()),
  createdAt: v.number(),
  updatedAt: v.number(),
};

// Args used when creating a project from the client
export const projectCreateArgs = {
  name: v.string(),
  description: v.optional(v.string()),
};

// Validator for partial project updates
export const projectUpdateValidator = {
  name: v.optional(v.string()),
  description: v.optional(v.string()),
  status: v.optional(v.string()),
  teamMemberCount: v.optional(v.number()),
  startDate: v.optional(v.number()),
};

// ---------- Table Definitions (for compose in main schema) ----------
export const projectTable = defineTable(projectSchema)
  .index("by_name", ["name"])
  .index("by_owner", ["ownerId"])
  .index("by_status", ["status"])
  .index("by_created_at", ["createdAt"]);




  export default defineTable(projectSchema)
  .index("by_name", ["name"])
  .index("by_owner", ["ownerId"])
  .index("by_status", ["status"])
  .index("by_created_at", ["createdAt"]);

