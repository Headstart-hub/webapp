import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { 
  userBasicInfoValidator,
  userProfileUpdateValidator
} from "./schemas/user_schema";

// Create or update a user
export const upsertUser = mutation({
  args: userBasicInfoValidator,
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Check if user already exists by clerkId
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!existingUser) {
      // Enforce email uniqueness
      const normalizedEmail = args.email.toLowerCase().trim();
      const existingEmail = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", normalizedEmail))
        .first();
      
      if (existingEmail) {
        throw new Error("Email already exists");
      }

      // Create new user
      return await ctx.db.insert("users", {
        firstName: args.firstName,
        lastName: args.lastName,
        email: normalizedEmail,
        imageUrl: args.imageUrl,
        clerkId: args.clerkId,
        profileCompleted: false,
        profileCompletionStep: "basic",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
  },
});

// Complete user profile
export const completeProfile = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      throw new Error("User not found");
    }
    return await ctx.db.patch(user._id, {
      profileCompleted: true,
      profileCompletionStep: "complete",
      updatedAt: Date.now(),
    });
  },
});


// Update profile data during signup process
export const updateProfileData = mutation({
  args: userProfileUpdateValidator,
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // Enforce email uniqueness if email is being updated
    if (args.email !== undefined) {
      const normalizedEmail = args.email.toLowerCase().trim();
      const existingEmail = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", normalizedEmail))
        .first();
      
      if (existingEmail && existingEmail._id !== user._id) {
        throw new Error("Email already exists");
      }
    }

    // Only include fields that were provided in args
    const update: Record<string, unknown> = { updatedAt: Date.now() };
    for (const key of Object.keys(args)) {
      const value = (args as any)[key];
      if (value !== undefined) {
        // Normalize email if provided
        if (key === "email") {
          update[key] = (value as string).toLowerCase().trim();
        } else {
          update[key] = value;
        }
      }
    }

    return await ctx.db.patch(user._id, update);
  },
});

// Update profile picture
export const updateProfilePicture = mutation({
  args: {
    profilePicture: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    return await ctx.db.patch(user._id, {
      profilePicture: args.profilePicture,
      updatedAt: Date.now(),
    });
  },
});

// Get current user
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();
  },
});

// Get user by ID
export const getUserById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

// Get user by email
export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
  },
});

// Get all users (for admin purposes)
export const getAllUsers = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    return await ctx.db.query("users").collect();
  },
});

export const getProjectInviteCount= query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return 0;

    const user = await ctx.db.query("users").withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject)).first();
    if (!user) return 0;

    const candidates = await ctx.db.query("projectCandidates").withIndex("by_email", (q) => q.eq("email", user.email as string)).collect();
    return candidates.filter((c) => c.invitationStatus === "pending").length;
  },
});