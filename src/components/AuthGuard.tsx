"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, ReactNode } from "react";

interface AuthGuardProps {
  children: ReactNode;
  requireAuth?: boolean;
  requireProfile?: boolean;
}

export default function AuthGuard({
  children,
  requireAuth = true,
  requireProfile = true,
}: AuthGuardProps) {
  const { isSignedIn, isLoaded, user: authUser } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const user = useQuery(api.users.getCurrentUser);

  useEffect(() => {
    if (!isLoaded) return;

    // If auth is required but user is not signed in
    if (requireAuth && !isSignedIn) {
      router.push("/");
      return;
    }

    // If user is signed in but trying to access public routes
    if (isSignedIn && pathname === "/") {
      // Check if profile is completed
      if (user && !user.profileCompleted && requireProfile) {
        router.push("/signup");
        return;
      }
    }

    // If profile completion is required but user hasn't completed it
    if (
      requireProfile &&
      isSignedIn &&
      user &&
      !user.profileCompleted &&
      pathname !== "/signup"
    ) {
      router.push("/signup");
      return;
    }

    // If user has completed profile but is on signup page, redirect to home
    if (isSignedIn && user?.profileCompleted && pathname === "/signup") {
      router.push("/");
      return;
    }
  }, [
    isLoaded,
    isSignedIn,
    user,
    pathname,
    router,
    requireAuth,
    requireProfile,
  ]);

  // Show loading while Clerk is loading
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If auth is required but user is not signed in, show nothing (redirect will happen)
  if (requireAuth && !isSignedIn) {
    return null;
  }

  // If profile is required but user hasn't completed it, show nothing (redirect will happen)
  if (
    requireProfile &&
    isSignedIn &&
    user &&
    !user.profileCompleted &&
    pathname !== "/signup"
  ) {
    return null;
  }

  // Show children if all conditions are met
  return <>{children}</>;
}

// Specific guard for public routes (like landing page)
export function PublicGuard({ children }: { children: ReactNode }) {
  return (
    <AuthGuard requireAuth={false} requireProfile={false}>
      {children}
    </AuthGuard>
  );
}

// Specific guard for authenticated routes that don't require profile completion
export function AuthOnlyGuard({ children }: { children: ReactNode }) {
  return (
    <AuthGuard requireAuth={true} requireProfile={false}>
      {children}
    </AuthGuard>
  );
}

// Specific guard for routes that require both auth and profile completion
export function ProtectedGuard({ children }: { children: ReactNode }) {
  return (
    <AuthGuard requireAuth={true} requireProfile={true}>
      {children}
    </AuthGuard>
  );
}
