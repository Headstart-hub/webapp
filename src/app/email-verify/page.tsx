"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSignUp } from "@clerk/nextjs";

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
            router.replace("/");
            return;
          }
        }

        // If no code param (or still not complete), ask Clerk for current status
        const refreshed = await signUp.reload();
        if (refreshed.status === "complete") {
          await setActive({ session: refreshed.createdSessionId });
          router.replace("/");
          return;
        }

        router.replace("/");
      } catch (err: unknown) {
        const e = err as
          | {
              errors?: Array<{ longMessage?: string; message?: string }>;
              message?: string;
            }
          | undefined;
        console.error("Email verification error:", err);
        router.replace("/");
      }
    })();
  }, [isLoaded, params, router, running, setActive, signUp]);

  return (
    <p className="text-base font-medium text-custom-fg">
      Finalising email verification.
    </p>
  );
}
