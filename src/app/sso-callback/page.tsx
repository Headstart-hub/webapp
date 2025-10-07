"use client";

import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";
import { OAuthStrategy } from '@clerk/types'
import { useSignIn } from "@clerk/nextjs";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAlertify } from "@/lib/alertifyClient";

export default function SsoCallbackPage() {
  const { signIn, isLoaded } = useSignIn();
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get("error");

    if (error === "identifier_already_exists" && isLoaded) {
      // Retry as sign-in
      signIn.authenticateWithRedirect({
        strategy: params.get("strategy") as OAuthStrategy,
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/",
      }).catch(async () => {
        (await getAlertify()).error("Error signing in. Please try again.");
        router.replace("/");
      });
    }
  }, [isLoaded, signIn, router]);

  return <AuthenticateWithRedirectCallback />;
}