// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ---------- Reference data ----------
  countries: defineTable({
    code: v.string(),   // ISO-3166-1 alpha-2, e.g. "AU"
    name: v.string(),   // "Australia"
  }).index("by_code", ["code"]),

  subdivisions: defineTable({
    countryCode: v.string(),   // "AU"
    code: v.string(),          // ISO-3166-2, e.g. "AU-VIC"
    name: v.string(),          // "Victoria"
  })
    .index("by_country", ["countryCode"])
    .index("by_code", ["code"]),

  institutions: defineTable({
    name: v.string(),                  
    type: v.union(
      v.literal("university"),
      v.literal("college"),
      v.literal("school"),
      v.literal("bootcamp"),
      v.literal("other")
    ),
    domain: v.optional(v.string()),
    countryCode: v.optional(v.string()),
    subdivisionCode: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_name", ["name"])
    .index("by_domain", ["domain"]),

  // ---------- Core user profile ----------
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    emailLower: v.string(),
    username: v.string(),

    firstName: v.string(),
    lastName: v.string(),
    imageUrl: v.optional(v.string()),

    roles: v.array(
      v.union(
        v.literal("student"),
        v.literal("professional"),
        v.literal("organizer"),
        v.literal("mentor")
      )
    ),
    isStudent: v.boolean(),

    countryCode: v.optional(v.string()),
    subdivisionCode: v.optional(v.string()),
    citySuburb: v.optional(v.string()),
    streetAddress: v.optional(v.string()),
    postalCode: v.optional(v.string()),

    contactNumberE164: v.optional(v.string()),

    birthdate: v.optional(v.string()),
    gender: v.optional(
      v.union(
        v.literal("male"),
        v.literal("female"),
        v.literal("non_binary"),
        v.literal("prefer_not_to_say"),
        v.literal("other")
      )
    ),

    occupation: v.optional(v.string()),
    experienceLevel: v.optional(
      v.union(
        v.literal("student"),
        v.literal("junior"),
        v.literal("mid"),
        v.literal("senior"),
        v.literal("lead"),
        v.literal("other")
      )
    ),

    bio: v.optional(v.string()),
    interests: v.optional(v.array(v.string())),
    profileCompleted: v.boolean(),
    profileCompletionStep: v.optional(v.number()),

    allowShareContact: v.optional(v.boolean()),
    allowShareLocation: v.optional(v.boolean()),
    allowDisplayEducation: v.optional(v.boolean()),

    verifiedEmail: v.optional(v.boolean()),
    verificationStatus: v.optional(
      v.union(
        v.literal("unverified"),
        v.literal("pending"),
        v.literal("verified"),
        v.literal("rejected")
      )
    ),

    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_email_lower", ["emailLower"])
    .index("by_username", ["username"])
    .index("by_country", ["countryCode"])
    .index("by_subdivision", ["subdivisionCode"]),

  // ---------- Education (1:N per user) ----------
  userEducations: defineTable({
    userId: v.id("users"),
    institutionId: v.id("institutions"),
    degreeTitle: v.string(),
    fieldOfStudy: v.optional(v.string()),
    description: v.optional(v.string()),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    isCurrent: v.optional(v.boolean()),
    verificationStatus: v.optional(
      v.union(
        v.literal("unverified"),
        v.literal("pending"),
        v.literal("verified"),
        v.literal("rejected")
      )
    ),
    proofUrl: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_institution", ["institutionId"]),

// ========= Languages & user languages =========

  // Reference: ISO 639 language codes recommended.
  languages: defineTable({
    code: v.string(),   // e.g., "en", "vi"
    name: v.string(),   // "English", "Vietnamese"
  })
    .index("by_code", ["code"])
    .index("by_name", ["name"]),

  // Junction: a user can speak multiple languages (with extra attrs).
  userLanguages: defineTable({
    userId: v.id("users"),
    languageId: v.id("languages"),
    fluency: v.union(
      // Pick one scale and stick to it. Replace with CEFR if you prefer.
      v.literal("beginner"),
      v.literal("intermediate"),
      v.literal("advanced"),
      v.literal("native")
    ),
    comments: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_language", ["languageId"])
    // Use this composite to enforce uniqueness in code
    .index("by_user_language", ["userId", "languageId"]),

  // ========= Profile change audit =========
  profileChangeLogs: defineTable({
    userId: v.id("users"),            // whose profile changed
    editorUserId: v.optional(v.id("users")), // who made the change (self/admin)
    fieldPath: v.string(),            // e.g. "users.firstName" or "users.bio"
    oldValue: v.optional(v.any()),    // store pre-change value
    newValue: v.optional(v.any()),    // (optional but useful)
    reason: v.optional(v.string()),
    ipAddress: v.optional(v.string()),
    changedAt: v.number(),            // Date.now()
  })
    .index("by_user", ["userId"])
    .index("by_field", ["fieldPath"])
    .index("by_changed_at", ["changedAt"]),

  // ========= Login events =========
  userLoginEvents: defineTable({
    userId: v.id("users"),
    provider: v.optional(v.string()),   // e.g., "clerk"
    sessionId: v.optional(v.string()),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    success: v.optional(v.boolean()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_created_at", ["createdAt"]),

    // ---------- Projects ----------
  projects: defineTable({
    name: v.string(),                 // project title
    ownerId: v.id("users"),           // creator
    description: v.optional(v.string()),
    teamMemberCount: v.number(),      // denormalized; keep in sync via mutations
    statusId: v.optional(v.id("projectStatuses")),
    startDate: v.optional(v.number()),// epoch ms
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_name", ["name"])
    .index("by_owner", ["ownerId"])
    .index("by_status", ["statusId"])
    .index("by_created_at", ["createdAt"]),

  // ---------- Project Status ----------
  projectStatuses: defineTable({
    description: v.string(),   // e.g. "Draft", "Open", "In progress", "Closed"
    sequence: v.number(),      // ordering
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_description", ["description"])
    .index("by_sequence", ["sequence"]),

  // ---------- Project Change Log (audit) ----------
  projectChangeLogs: defineTable({
    projectId: v.id("projects"),
    editorUserId: v.optional(v.id("users")),
    fieldPath: v.string(),          // e.g. "projects.description" or "projects.statusId"
    oldValue: v.optional(v.any()),  // if your Convex version lacks any(), use stringified JSON
    newValue: v.optional(v.any()),
    reason: v.optional(v.string()),
    ipAddress: v.optional(v.string()),
    changedAt: v.number(),
  })
    .index("by_project", ["projectId"])
    .index("by_changed_at", ["changedAt"]),

  // ---------- Skills Taxonomy ----------
  skillCategories: defineTable({
    description: v.string(),  // e.g. "Backend", "Data", "Design"
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_description", ["description"]),

  skills: defineTable({
    description: v.string(),              // e.g. "Python", "React", "UX Research"
    categoryId: v.optional(v.id("skillCategories")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_description", ["description"])
    .index("by_category", ["categoryId"]),

  // ---------- Proficiency scale ----------
  skillProficiencies: defineTable({
    description: v.string(),   // e.g. "Beginner", "Intermediate", "Advanced", "Expert"
    rating: v.number(),        // numeric (e.g., 1..4 or 1..10)
    sequence: v.number(),      // for ordered display
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_rating", ["rating"])
    .index("by_sequence", ["sequence"]),

  // ---------- User ↔ Skill (bridge) ----------
  userSkills: defineTable({
    userId: v.id("users"),
    skillId: v.id("skills"),
    proficiencyId: v.optional(v.id("skillProficiencies")),
    addedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_skill", ["skillId"])
    .index("by_user_skill", ["userId", "skillId"]), // for uniqueness checks

  // ---------- Project ↔ Skill (bridge) ----------
  projectSkills: defineTable({
    projectId: v.id("projects"),
    skillId: v.id("skills"),
    requiredProficiencyId: v.optional(v.id("skillProficiencies")),
    sequence: v.number(), // ordering within project
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_project", ["projectId"])
    .index("by_skill", ["skillId"])
    .index("by_project_skill", ["projectId", "skillId"]), // uniqueness check

  // ---------- Recruitment Status (vocabulary) ----------
projectRecruitmentStatuses: defineTable({
  description: v.string(),     // e.g., "Applied", "Shortlisted", "Interviewing", "Accepted", "Rejected"
  sequence: v.number(),        // ordering for UI
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_description", ["description"])
  .index("by_sequence", ["sequence"]),

// ---------- Project Candidates (User ↔ Project applications) ----------
projectCandidates: defineTable({
  projectId: v.id("projects"),
  userId: v.id("users"),
  appliedAt: v.number(),                 // epoch ms, "join date time" of the candidacy
  coverLetter: v.optional(v.string()),
  recruitmentStatusId: v.optional(v.id("projectRecruitmentStatuses")),
  updatedAt: v.number(),
})
  .index("by_project", ["projectId"])
  .index("by_user", ["userId"])
  .index("by_status", ["recruitmentStatusId"])
  .index("by_project_user", ["projectId", "userId"]) // uniqueness check
  .index("by_applied_at", ["appliedAt"]),

// ---------- Member Status (vocabulary) ----------
// Project Member Status vocabulary
projectMemberStatuses: defineTable({
  description: v.string(),   // "Active", "On hold", "Left"
  kind: v.union(             // semantic bucket for logic
    v.literal("active"),
    v.literal("on_hold"),
    v.literal("left")
  ),
  sequence: v.number(),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_description", ["description"])
  .index("by_kind", ["kind"])
  .index("by_sequence", ["sequence"]),

// Reasons you can pick when moving to on_hold/left
memberStatusReasons: defineTable({
  code: v.string(),                 // e.g., "study_exam", "health", "workload", "project_end", "other"
  description: v.string(),          // human-readable
  appliesTo: v.union(               // which status kind this reason is for
    v.literal("on_hold"),
    v.literal("left")
  ),
  sequence: v.number(),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_code", ["code"])
  .index("by_applies_to", ["appliesTo"])
  .index("by_sequence", ["sequence"]),

// ---------- Project Members ----------
// 1) Project-specific role templates
projectRoleDefinitions: defineTable({
  projectId: v.id("projects"),
  key: v.string(),                 // e.g. "backend_engineer", unique per project if you want
  name: v.string(),                // e.g. "Backend Engineer"
  description: v.optional(v.string()),
  permissions: v.optional(v.array(v.string())), // optional fine-grained caps, e.g. ["manage_candidates"]
  requiredSkillIds: v.optional(v.array(v.id("skills"))), // optional guidance
  sequence: v.number(),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_project", ["projectId"])
  .index("by_project_key", ["projectId", "key"])
  .index("by_project_name", ["projectId", "name"]),

// 2) Project members (separate authRole from title)
projectMembers: defineTable({
  projectId: v.id("projects"),
  userId: v.id("users"),

  // Authorization role (small enum → stable permissions)
  authRole: v.union(
    v.literal("owner"),
    v.literal("admin"),
    v.literal("member"),
    v.literal("viewer")
  ),

  // Membership lifecycle
  joinedAt: v.number(),
  leftAt: v.optional(v.number()),
  statusId: v.optional(v.id("projectMemberStatuses")),
  statusReasonId: v.optional(v.id("memberStatusReasons")), // current reason (if any)
  statusNote: v.optional(v.string()),                      // free-text note
  expectedReturnAt: v.optional(v.number()),                // only for on_hold
  updatedAt: v.number(),

  // Title: either reference a template…
  roleDefinitionId: v.optional(v.id("projectRoleDefinitions")),
  // …or override with free text
  memberTitle: v.optional(v.string()),
  titleDescription: v.optional(v.string()),

  // Fine-grained per-member overrides (optional)
  grants: v.optional(v.array(v.string())),     // add specific permissions
  revokes: v.optional(v.array(v.string())),    // remove specific permissions
})
  .index("by_project", ["projectId"])
  .index("by_user", ["userId"])
  .index("by_status", ["statusId"])
  .index("by_project_user", ["projectId", "userId"]),

  // ---------- Chats (per project) ----------
chats: defineTable({
  projectId: v.id("projects"),
  name: v.string(),            // e.g., "General", "Design", "Sprint 12"
  createdAt: v.number(),
  updatedAt: v.number(),
  createdByUserId: v.id("users"),
})
  .index("by_project", ["projectId"])
  .index("by_name_in_project", ["projectId", "name"])
  .index("by_created_at", ["createdAt"]),

// ---------- Chat Participants ----------
chatParticipants: defineTable({
  chatId: v.id("chats"),
  userId: v.id("users"),
  joinedAt: v.number(),
  leftAt: v.optional(v.number()),

  // denormalized convenience for unread counts & fast queries
  lastReadAt: v.optional(v.number()),           // last read timestamp in this chat
  lastReadMessageId: v.optional(v.id("chatMessages")),
})
  .index("by_chat", ["chatId"])
  .index("by_user", ["userId"])
  .index("by_chat_user", ["chatId", "userId"]),

// ---------- Chat Messages ----------
chatMessages: defineTable({
  chatId: v.id("chats"),
  sentByUserId: v.id("users"),

  // content: text and/or one file (keep simple now; can expand to array later)
  content: v.optional(v.string()),
  fileUrl: v.optional(v.string()),              // "message field link"
  fileType: v.optional(v.string()),             // "message file type" (e.g., "image/png", "application/pdf")

  repliedToMessageId: v.optional(v.id("chatMessages")),
  sentAt: v.number(),                           // epoch ms
  editedAt: v.optional(v.number()),
  deletedAt: v.optional(v.number()),
})
  .index("by_chat", ["chatId"])
  .index("by_sender", ["sentByUserId"])
  .index("by_sent_at", ["chatId", "sentAt"])    // for pagination
  .index("by_replied_to", ["repliedToMessageId"]),

// ---------- Read Receipts (per user, per message) ----------
chatMessageReadReceipts: defineTable({
  messageId: v.id("chatMessages"),
  userId: v.id("users"),
  readAt: v.number(),
})
  .index("by_message", ["messageId"])
  .index("by_user", ["userId"])
  .index("by_message_user", ["messageId", "userId"]),

// ---------- Error Report vocabularies ----------
errorReportSeverities: defineTable({
  description: v.string(),     // e.g., "Low", "Medium", "High", "Critical"
  sequence: v.number(),        // sort order
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_description", ["description"])
  .index("by_sequence", ["sequence"]),

errorReportPriorities: defineTable({
  description: v.string(),     // e.g., "P3", "P2", "P1"
  sequence: v.number(),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_description", ["description"])
  .index("by_sequence", ["sequence"]),

errorReportStatuses: defineTable({
  description: v.string(),     // e.g., "Open", "In Progress", "Resolved", "Closed"
  sequence: v.number(),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_description", ["description"])
  .index("by_sequence", ["sequence"]),

errorReportCategories: defineTable({
  description: v.string(),     // e.g., "UI", "Backend", "Auth", "Payments"
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_description", ["description"]),

// ---------- Error Reports (main) ----------
errorReports: defineTable({
  reportedByUserId: v.id("users"),     // FK -> users

  // timing
  reportedAt: v.number(),              // "date time"
  resolvedAt: v.optional(v.number()),  // "resolution date"

  // content
  description: v.string(),
  reproduceSteps: v.optional(v.string()),
  expectedResult: v.optional(v.string()),
  actualResult: v.optional(v.string()),
  resolutionDescription: v.optional(v.string()),

  // vocab FKs
  statusId: v.id("errorReportStatuses"),
  severityId: v.id("errorReportSeverities"),
  priorityId: v.id("errorReportPriorities"),
  categoryId: v.id("errorReportCategories"),

  // housekeeping
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_reporter", ["reportedByUserId"])
  .index("by_status", ["statusId"])
  .index("by_severity", ["severityId"])
  .index("by_priority", ["priorityId"])
  .index("by_category", ["categoryId"])
  .index("by_reported_at", ["reportedAt"])
  .index("by_resolved_at", ["resolvedAt"]),

// ---------- Attachments (N per report) ----------
errorReportAttachments: defineTable({
  reportId: v.id("errorReports"),
  url: v.string(),                     // "attachment link"
  createdAt: v.number(),
})
  .index("by_report", ["reportId"]),

// ---------- Platforms / Environment (N per report) ----------
errorReportPlatforms: defineTable({
  reportId: v.id("errorReports"),
  deviceName: v.optional(v.string()),     // e.g., "iPhone 14 Pro"
  deviceVersion: v.optional(v.string()),  // e.g., "iOS 17.5"
  browserName: v.optional(v.string()),    // e.g., "Chrome"
  browserVersion: v.optional(v.string()), // e.g., "124.0.6367.60"
  createdAt: v.number(),
})
  .index("by_report", ["reportId"]),

// ---------- OPTIONAL: Status change history (audit trail) ----------
errorReportStatusChanges: defineTable({
  reportId: v.id("errorReports"),
  fromStatusId: v.optional(v.id("errorReportStatuses")),
  toStatusId: v.id("errorReportStatuses"),
  changedByUserId: v.id("users"),
  note: v.optional(v.string()),        // why it changed
  resolutionDescription: v.optional(v.string()), // capture on resolve if provided
  changedAt: v.number(),
  createdAt: v.number(),
})
  .index("by_report", ["reportId"])
  .index("by_changed_at", ["changedAt"]),

// ---------- User Report vocabularies ----------
userReportReasons: defineTable({
  description: v.string(),       // e.g., "Harassment", "Spam", "Impersonation", "Other"
  sequence: v.number(),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_description", ["description"])
  .index("by_sequence", ["sequence"]),

userReportStatuses: defineTable({
  description: v.string(),       // e.g., "Open", "Under Review", "Action Taken", "Closed"
  sequence: v.number(),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_description", ["description"])
  .index("by_sequence", ["sequence"]),

userReportSeverities: defineTable({
  description: v.string(),       // e.g., "Low", "Medium", "High", "Critical"
  sequence: v.number(),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_description", ["description"])
  .index("by_sequence", ["sequence"]),

// ---------- User Reports (main) ----------
userReports: defineTable({
  reportedUserId: v.id("users"),          // who the report is about
  // Recommended: who submitted; add if you allow non-anonymous reports
  reportedByUserId: v.optional(v.id("users")),

  reportedAt: v.number(),                 // date time
  resolvedAt: v.optional(v.number()),     // resolution date time

  description: v.string(),
  resolutionNotes: v.optional(v.string()),

  reasonId: v.id("userReportReasons"),
  statusId: v.id("userReportStatuses"),
  severityId: v.id("userReportSeverities"),

  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_reported_user", ["reportedUserId"])
  .index("by_reporter", ["reportedByUserId"])
  .index("by_status", ["statusId"])
  .index("by_severity", ["severityId"])
  .index("by_reason", ["reasonId"])
  .index("by_reported_at", ["reportedAt"])
  .index("by_resolved_at", ["resolvedAt"]),

// ---------- Attachments (N per report) ----------
userReportAttachments: defineTable({
  reportId: v.id("userReports"),
  url: v.string(),                         // attachment link (screenshots, etc.)
  createdAt: v.number(),
})
  .index("by_report", ["reportId"]),

// ---------- OPTIONAL: Status change history (audit trail) ----------
userReportStatusChanges: defineTable({
  reportId: v.id("userReports"),
  fromStatusId: v.optional(v.id("userReportStatuses")),
  toStatusId: v.id("userReportStatuses"),
  changedByUserId: v.id("users"),
  note: v.optional(v.string()),
  changedAt: v.number(),
  createdAt: v.number(),
})
  .index("by_report", ["reportId"])
  .index("by_changed_at", ["changedAt"]),
});