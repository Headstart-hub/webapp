"use client";

import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";
import { OAuthStrategy } from "@clerk/types";
import { useSignIn } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

export default function SsoCallbackPage() {
  const { signIn, isLoaded } = useSignIn();
  const router = useRouter();
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertTitle, setAlertTitle] = useState<string>("");
  const [alertDescription, setAlertDescription] = useState<string>("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get("error");

    if (error === "identifier_already_exists" && isLoaded) {
      // Retry as sign-in
      signIn
        .authenticateWithRedirect({
          strategy: params.get("strategy") as OAuthStrategy,
          redirectUrl: "/sso-callback",
          redirectUrlComplete: "/",
        })
        .catch(async () => {
          setAlertTitle("Error signing in");
          setAlertDescription("Please try again.");
          setAlertOpen(true);
          router.replace("/");
        });
    }
  }, [isLoaded, signIn, router]);

  return (
    <>
      <AuthenticateWithRedirectCallback />
      <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{alertTitle}</AlertDialogTitle>
            <AlertDialogDescription>{alertDescription}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setAlertOpen(false)}>
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
