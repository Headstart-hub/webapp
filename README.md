## Prerequisites

Before you begin, ensure you have the following installed on your system:

### Node.js Installation

This project requires **Node.js version 18.17 or higher**. Here's how to install it:

#### Option 1: Download from Official Website (Recommended)

1. Visit [nodejs.org](https://nodejs.org/)
2. Download the **LTS (Long Term Support)** version for your operating system
3. Run the installer and follow the setup wizard
4. Restart your terminal/command prompt after installation

### Verify Installation

After installation, verify that Node.js and npm are properly installed:

```bash
# Check Node.js version
node --version

# Check npm version
npm --version
```

You should see output similar to:

```
v18.17.0
9.6.7
```

## Getting Started

1. **Clone the repository:**

   ```bash
   git clone <your-repository-url>
   cd headstart
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up your environment variables:**

   - Create a `.env.local` file in the root directory
   - Add your Clerk and Convex credentials (see Environment Setup section below)

4. **Run the development server:**

   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

6. **Run convex dev server:**

```bash
npx convex dev
```

### Environment Setup

Create a `.env` file in the root directory with the following variables:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Convex Backend
CLERK_JWT_ISSUER_DOMAIN
NEXT_PUBLIC_CLERK_FRONTEND_API_URL
```

**Note**: Replace the placeholder values with your actual Clerk and Convex credentials. You can obtain these from your respective dashboard accounts.

## Project Structure

```
src/
├── app/
│   ├── signup/          # User onboarding page
│   ├── layout.tsx       # Root layout with auth
│   └── page.tsx         # Main dashboard
├── components/
│   ├── ui/              # UI components
│   ├── AuthGuard.tsx    # Authentication guards
│   ├── UserSync.tsx     # User data synchronization
│   └── LandingPage.tsx  # Landing page for visitors
└── middleware.ts         # Clerk middleware
```

## Technologies Used

- **Frontend**: Next.js 14, React, TypeScript
- **Authentication**: Clerk
- **Backend**: Convex
- **Styling**: Tailwind CSS
- **Database**: Convex (built on top of PostgreSQL)

## Database Schema Management

### Insert or Update Database Schema on Convex

After setting up your Convex backend, you'll need to define your database schema. The schema is defined in the `convex/schema.ts` file and automatically creates the necessary database tables, constraints, and indexes.

#### 1. Schema Definition

Your schema is defined in `convex/schema.ts`. Here's an example of how to define tables with proper constraints:

```typescript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    // Primary Key (automatically created as _id)
    name: v.string(),
    email: v.string(),
    image: v.optional(v.string()),

    // Profile fields
    bio: v.optional(v.string()),
    location: v.optional(v.string()),
    occupation: v.optional(v.string()),
    experienceLevel: v.optional(
      v.union(
        v.literal("beginner"),
        v.literal("intermediate"),
        v.literal("advanced"),
        v.literal("expert")
      )
    ),
    interests: v.optional(v.array(v.string())),

    // Metadata
    profileCompleted: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_email", ["email"]) // Secondary index
    .index("by_profile_completion", ["profileCompleted"]) // Composite index
    .index("by_experience_level", ["experienceLevel"]), // Index for filtering

  messages: defineTable({
    // Foreign Key reference to users table
    userId: v.id("users"),
    content: v.string(),
    timestamp: v.number(),
    isRead: v.boolean(),
  })
    .index("by_user", ["userId"]) // Foreign key index
    .index("by_timestamp", ["timestamp"]) // Time-based index
    .index("by_user_and_timestamp", ["userId", "timestamp"]), // Composite index
});
```

#### 2. Schema Constraints and Best Practices

**Primary Keys:**

- Convex automatically creates a unique `_id` field as the primary key for each table
- This field is of type `v.id()` and is immutable

**Foreign Keys:**

- Use `v.id("tableName")` to reference other tables
- Always create indexes on foreign key fields for better query performance
- Example: `userId: v.id("users")` creates a foreign key relationship

**Indexes:**

- **Single field indexes**: `["fieldName"]` for simple queries
- **Composite indexes**: `["field1", "field2"]` for multi-field queries
- **Order matters**: Put the most selective field first in composite indexes

**Data Types and Constraints:**

- Use `v.optional()` for nullable fields
- Use `v.union()` for enum-like fields with specific allowed values
- Use `v.array()` for array fields
- Use `v.object()` for nested object structures

#### 3. Deploying Schema Changes

After modifying your schema:

```bash
# Deploy schema changes to your Convex backend
npx convex deploy

# Or run in development mode to see changes immediately
npx convex dev
```

#### 4. Schema Migration Best Practices

**Adding New Fields:**

```typescript
// Add new optional field (safe for existing data)
newField: v.optional(v.string()),

// Add new required field with default (requires migration)
newField: v.string(), // Will need to provide default values
```

**Modifying Existing Fields:**

```typescript
// Change from optional to required (requires data migration)
// oldField: v.optional(v.string()),
oldField: v.string(), // Ensure all existing records have values
```

**Adding New Tables:**

```typescript
// New table with proper relationships
newTable: defineTable({
  userId: v.id("users"), // Reference existing users table
  data: v.string(),
  createdAt: v.number(),
})
  .index("by_user", ["userId"])
  .index("by_created", ["createdAt"]),
```

#### 5. Common Schema Patterns

**User Authentication Pattern:**

```typescript
users: defineTable({
  clerkId: v.string(), // External auth ID
  email: v.string(),
  name: v.string(),
  // ... other fields
})
  .index("by_clerk_id", ["clerkId"])
  .index("by_email", ["email"]),
```

**Timestamps Pattern:**

```typescript
posts: defineTable({
  title: v.string(),
  content: v.string(),
  authorId: v.id("users"),
  createdAt: v.number(), // Unix timestamp
  updatedAt: v.number(), // Unix timestamp
})
  .index("by_author", ["authorId"])
  .index("by_created", ["createdAt"])
  .index("by_updated", ["updatedAt"]),
```

**Soft Delete Pattern:**

```typescript
items: defineTable({
  name: v.string(),
  isDeleted: v.boolean(), // Soft delete flag
  deletedAt: v.optional(v.number()),
})
  .index("by_deleted", ["isDeleted"])
  .index("by_name", ["name"]),
```

#### 6. Schema Validation

Convex automatically validates your schema:

- Type checking at compile time
- Runtime validation of data
- Automatic constraint enforcement
- Index optimization suggestions

**Note**: Always test schema changes in development before deploying to production. Use `npx convex dev` to see immediate feedback on your schema modifications.
