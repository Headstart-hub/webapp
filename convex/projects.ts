import { mutation, query } from "./_generated/server";
import { projectCreateArgs, projectUpdateValidator } from "./schemas/project_schema";
import { v } from "convex/values";

// ---------- Project Mutations ----------
export const createProject = mutation({
  args: projectCreateArgs,
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const owner = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!owner) {
      throw new Error("User not found");
    }

    const now = Date.now();
    return await ctx.db.insert("projects", {
      name: args.name,
      description: args.description,
      ownerId: owner._id,
      teamMemberCount: 1,
      status: "Open",
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateProject = mutation({
  args: {
    projectId: v.id("projects"),
    ...projectUpdateValidator,
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    const owner = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();
    if (!owner || project.ownerId !== owner._id) {
      throw new Error("Forbidden");
    }

    const update = { updatedAt: Date.now() } as Record<string, unknown>;
    for (const key of Object.keys(projectUpdateValidator)) {
      const value = (args as any)[key];
      if (value !== undefined) update[key] = value;
    }

    return await ctx.db.patch(args.projectId, update);
  },
});

// ---------- Project Queries ----------
export const listMy = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const me = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();
    if (!me) return [];

    const projects = await ctx.db
      .query("projects")
      .withIndex("by_owner", (q) => q.eq("ownerId", me._id))
      .order("desc")
      .collect();

    // Attach owner basic fields for display
    return await Promise.all(
      projects.map(async (p) => {
        const owner = await ctx.db.get(p.ownerId);
        return {
          _id: p._id,
          name: p.name,
          description: p.description,
          status: p.status,
          updatedAt: p.updatedAt,
          teamMemberCount: p.teamMemberCount,
          owner: owner
            ? {
                _id: owner._id,
                firstName: owner.firstName,
                lastName: owner.lastName,
                imageUrl: owner.imageUrl,
              }
            : null,
        };
      })
    );
  },
});

// Fetch a single project by id with basic owner info
export const getById = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (!project) return null;

    const owner = await ctx.db.get(project.ownerId);
    return {
      _id: project._id,
      name: project.name,
      description: project.description,
      status: project.status,
      teamMemberCount: project.teamMemberCount,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      owner: owner
        ? {
            _id: owner._id,
            firstName: owner.firstName,
            lastName: owner.lastName,
            imageUrl: owner.imageUrl,
          }
        : null,
    };
  },
});