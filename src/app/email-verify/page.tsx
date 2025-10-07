"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSignUp } from "@clerk/nextjs";
import { getAlertify } from "@/lib/alertifyClient";

export default function EmailVerifyPage() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const params = useSearchParams();
  const router = useRouter();
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!isLoaded || running) return;
    setRunning(true);

    (async () => {
      try {
        const code =
          params.get("code") ||
          params.get("verification_code") ||
          params.get("token");

        if (code) {
          // Finalize using the code directly
          const res = await signUp.attemptEmailAddressVerification({ code });
          if (res.status === "complete") {
            await setActive({ session: res.createdSessionId });
            (await getAlertify()).success("Email verified!");
            router.replace("/");
            return;
          }
        }

        // If no code param (or still not complete), ask Clerk for current status
        const refreshed = await signUp.reload();
        if (refreshed.status === "complete") {
          await setActive({ session: refreshed.createdSessionId });
          (await getAlertify()).success("Email verified!");
          router.replace("/");
          return;
        }

        // Still pending: show a helpful message or route back to form
        (await getAlertify()).message(
          "We’re still waiting for your email verification. Please click the link we sent."
        );
        router.replace("/");
      } catch (err: unknown) {
        const e = err as { errors?: Array<{ longMessage?: string; message?: string }>; message?: string } | undefined
        console.error("Email verification error:", err);
        (await getAlertify()).error(
          e?.errors?.[0]?.longMessage ||
            e?.errors?.[0]?.message ||
            e?.message ||
            "Verification failed."
        );
        router.replace("/");
      }
    })();
  }, [isLoaded, params, router, running, setActive, signUp]);

  return <p className="text-base font-medium text-custom-fg">Finalising email verification.</p>;
}