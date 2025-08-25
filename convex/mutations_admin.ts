
import { mutation } from "./_generated/server";        
import { v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel"; // ← brings in Id<"…"> and Doc<"…">

export const seedAuGeoAndInstitutions = mutation({
  args: { secret: v.string() },
  handler: async (ctx, args) => {
    const { secret } = args;

    const SEED_SECRET = process.env.SEED_SECRET;
    if (!SEED_SECRET || secret !== SEED_SECRET) {
      throw new Error("Unauthorized.");
    }

    const now = Date.now();

    // ---- Upsert helpers (typed) ----
    async function upsertCountry(code: string, name: string): Promise<Id<"countries">> {
      const existing = await ctx.db
        .query("countries")
        .withIndex("by_code", (q) => q.eq("code", code))
        .unique(); // type: Doc<"countries"> | null
      if (existing) return existing._id;
      return await ctx.db.insert("countries", { code, name });
    }

    async function upsertSubdivision(
      countryCode: string,
      code: string,
      name: string
    ): Promise<Id<"subdivisions">> {
      const existing = await ctx.db
        .query("subdivisions")
        .withIndex("by_code", (q) => q.eq("code", code))
        .unique(); // Doc<"subdivisions"> | null
      if (existing) return existing._id;
      return await ctx.db.insert("subdivisions", { countryCode, code, name });
    }

    async function upsertInstitution(
      name: string,
      domain: string | undefined,
      countryCode: string,
      subdivisionCode: string,
      type: "university" | "college" | "school" | "bootcamp" | "other" = "university"
    ): Promise<Id<"institutions">> {
      let existing: Doc<"institutions"> | null = null;

      if (domain) {
        existing = await ctx.db
          .query("institutions")
          .withIndex("by_domain", (q) => q.eq("domain", domain))
          .unique(); // Doc<"institutions"> | null
      }
      if (!existing) {
        existing = await ctx.db
          .query("institutions")
          .withIndex("by_name", (q) => q.eq("name", name))
          .unique();
      }

      if (existing) {
        await ctx.db.patch(existing._id, {
          type,
          domain,
          countryCode,
          subdivisionCode,
          updatedAt: now,
        });
        return existing._id; // <- correctly typed Id<"institutions">
      }

      return await ctx.db.insert("institutions", {
        name,
        type,
        domain,
        countryCode,
        subdivisionCode,
        createdAt: now,
        updatedAt: now,
      });
    }

    // ---- Country: Australia ----
    await upsertCountry("AU", "Australia");

    // ---- AU States & Territories (ISO-3166-2) ----
    const auSubdivisions = [
      ["AU-VIC", "Victoria"],
      ["AU-NSW", "New South Wales"],
      ["AU-QLD", "Queensland"],
      ["AU-WA", "Western Australia"],
      ["AU-SA", "South Australia"],
      ["AU-TAS", "Tasmania"],
      ["AU-ACT", "Australian Capital Territory"],
      ["AU-NT", "Northern Territory"],
    ] as const;

    for (const [code, name] of auSubdivisions) {
      await upsertSubdivision("AU", code, name);
    }

    // ---- Sample universities ----
    const universities = [
      { name: "Monash University", domain: "monash.edu", subdivisionCode: "AU-VIC" },
      { name: "The University of Melbourne", domain: "unimelb.edu.au", subdivisionCode: "AU-VIC" },
      { name: "RMIT University", domain: "rmit.edu.au", subdivisionCode: "AU-VIC" },
      { name: "UNSW Sydney", domain: "unsw.edu.au", subdivisionCode: "AU-NSW" },
      { name: "The University of Queensland", domain: "uq.edu.au", subdivisionCode: "AU-QLD" },
    ] as const;

    for (const u of universities) {
      await upsertInstitution(u.name, u.domain, "AU", u.subdivisionCode, "university");
    }

    return { ok: true, seeded: "AU", timestamp: now };
  },
});