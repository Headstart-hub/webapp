/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as projectCandidates from "../projectCandidates.js";
import type * as projectMember from "../projectMember.js";
import type * as projects from "../projects.js";
import type * as schemas_projectCandidate_schema from "../schemas/projectCandidate_schema.js";
import type * as schemas_project_schema from "../schemas/project_schema.js";
import type * as schemas_projectmember_schema from "../schemas/projectmember_schema.js";
import type * as schemas_user_schema from "../schemas/user_schema.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  projectCandidates: typeof projectCandidates;
  projectMember: typeof projectMember;
  projects: typeof projects;
  "schemas/projectCandidate_schema": typeof schemas_projectCandidate_schema;
  "schemas/project_schema": typeof schemas_project_schema;
  "schemas/projectmember_schema": typeof schemas_projectmember_schema;
  "schemas/user_schema": typeof schemas_user_schema;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
