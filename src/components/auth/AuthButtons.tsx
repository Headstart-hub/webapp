"use client";
import * as React from "react";
import { useSignUp } from "@clerk/nextjs";
import { OAuthStrategy } from "@clerk/types";
import PrimaryButton from "@/components/ui/primarybutton";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

import { FcGoogle } from "react-icons/fc";
import GitHubIcon from "@mui/icons-material/GitHub";
import CircularProgress from "@mui/material/CircularProgress";

export function OAuthButtons() {
  const { isLoaded: signUpLoaded, signUp } = useSignUp();
  const [loading, setLoading] = React.useState<OAuthStrategy | null>(null);
  const [alertOpen, setAlertOpen] = React.useState(false);
  const [alertTitle, setAlertTitle] = React.useState<string>("Error");
  const [alertDescription, setAlertDescription] = React.useState<string>("");

  const authenticateWith = async (strategy: OAuthStrategy) => {
    if (!signUpLoaded || loading) return;
    setLoading(strategy);

    try {
      await signUp.authenticateWithRedirect({
        strategy,
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/",
      });
    } catch (err: unknown) {
      const e = err as
        | {
            errors?: Array<{ longMessage?: string; message?: string }>;
            message?: string;
          }
        | undefined;
      const msg =
        e?.errors?.[0]?.longMessage ||
        e?.errors?.[0]?.message ||
        e?.message ||
        "Could not start social login.";
      setAlertTitle("Social sign-in failed");
      setAlertDescription(msg);
      setAlertOpen(true);
    } finally {
      setLoading(null);
    }
  };

  return (
    <>
      <div className="flex flex-1 flex-row mt-3 gap-6 w-full items-center justify-center">
        <PrimaryButton
          variant="outlined"
          disabled={loading ? true : false}
          startIcon={
            loading === "oauth_google" ? (
              <CircularProgress size={17} />
            ) : (
              <FcGoogle />
            )
          }
          onClick={() => authenticateWith("oauth_google")}
        >
          Google
        </PrimaryButton>
        <PrimaryButton
          variant="outlined"
          disabled={loading ? true : false}
          startIcon={
            loading === "oauth_github" ? (
              <CircularProgress size={17} />
            ) : (
              <GitHubIcon />
            )
          }
          onClick={() => authenticateWith("oauth_github")}
        >
          GitHub
        </PrimaryButton>
      </div>

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
