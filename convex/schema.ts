import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// Social media validator
export const socialMediaValidator = v.optional(
  v.object({
    github: v.optional(v.string()),
    linkedin: v.optional(v.string()),
    website: v.optional(v.string()),
  })
);

// User profile validators
export const userBasicInfoValidator = {
  firstName: v.string(),
  lastName: v.string(),
  email: v.string(),
  clerkId: v.string(),
  imageUrl: v.optional(v.string()),
};

export const userProfileValidator = {
  profileCompleted: v.boolean(),
  profileCompletionStep: v.optional(v.union(v.literal("signup"), v.literal("basic"), v.literal("interests"), v.literal("technicalSkills"), v.literal("complete"))),
  profilePicture: v.optional(v.string()),
  socialMedia: socialMediaValidator,
  interests: v.optional(v.array(v.string())),
  technicalSkills: v.optional(v.array(v.string())),
  currentPosition: v.optional(v.string()),
  education: v.optional(v.string()),
  location: v.optional(v.string()),
  bio: v.optional(v.string()),
  occupation: v.optional(v.string()),
  experienceLevel: v.optional(v.string()),
  createdAt: v.number(),
  updatedAt: v.number(),
};

// Validator for partial profile updates from the client during signup/profile edit
// All fields are optional and restricted to user-editable fields only.
export const userProfileUpdateValidator = {
  firstName: v.optional(v.string()),
  lastName: v.optional(v.string()),
  email: v.optional(v.string()),
  imageUrl: v.optional(v.string()),
  socialMedia: socialMediaValidator,
  interests: v.optional(v.array(v.string())),
  technicalSkills: v.optional(v.array(v.string())),
  currentPosition: v.optional(v.string()),
  education: v.optional(v.string()),
  location: v.optional(v.string()),
  bio: v.optional(v.string()),
  occupation: v.optional(v.string()),
  experienceLevel: v.optional(v.string()),
  profileCompletionStep: v.optional(v.union(v.literal("basic"), v.literal("interests"), v.literal("technicalSkills"), v.literal("complete"))),
};

export default defineSchema({
  users: defineTable({
    // Basic user info
    ...userBasicInfoValidator,
    ...userProfileValidator,
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"]),
});


export type UserBasicInfo = typeof userBasicInfoValidator;
export type UserProfile = typeof userProfileValidator;
export type User = typeof userBasicInfoValidator & typeof userProfileValidator;