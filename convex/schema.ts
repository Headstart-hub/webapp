import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    imageUrl: v.optional(v.string()),
    clerkId: v.string(),
    profileCompleted: v.boolean(),
    profileCompletionStep: v.optional(v.number()),
    
    // Profile fields
    bio: v.optional(v.string()),
    interests: v.optional(v.array(v.string())),
    location: v.optional(v.string()),
    occupation: v.optional(v.string()),
    experienceLevel: v.optional(v.string()),
    
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"]),

  messages: defineTable({
    author: v.string(),
    content: v.string(),
    createdAt: v.number(),
  })
    .index("by_author", ["author"])
    .index("by_created_at", ["createdAt"]),
});
