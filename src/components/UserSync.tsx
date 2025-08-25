"use client";

import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useEffect } from "react";

export default function UserSync() {
  const { user, isLoaded } = useUser();
  const upsertUser = useMutation(api.users.upsertUser);

  useEffect(() => {
    if (isLoaded && user) {
      // Sync user data with Convex
      upsertUser({
        firstName: user.firstName || "Unknown",
        lastName: user.lastName || "User",
        email: user.primaryEmailAddress?.emailAddress || "",
        imageUrl: user.imageUrl,
        clerkId: user.id,
      }).catch(console.error);
    }
  }, [isLoaded, user, upsertUser]);

  // This component doesn't render anything
  return null;
}
