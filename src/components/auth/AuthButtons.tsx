"use client";
import * as React from "react";
import { useSignUp } from "@clerk/nextjs";
import { OAuthStrategy } from '@clerk/types'
import { getAlertify } from "@/lib/alertifyClient";
import PrimaryButton from "@/components/ui/primarybutton";

import { FcGoogle } from "react-icons/fc";
import GitHubIcon from '@mui/icons-material/GitHub';
import CircularProgress from '@mui/material/CircularProgress';

export function OAuthButtons() {
  const { isLoaded: signUpLoaded, signUp } = useSignUp();
  const [loading, setLoading] = React.useState<OAuthStrategy | null>(null);

  const authenticateWith = async (strategy: OAuthStrategy) => {
    if (!signUpLoaded || loading) return;
    setLoading(strategy);

    try {
      await signUp.authenticateWithRedirect({
        strategy,
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/",
      });
    } catch (err: any) {
      (await getAlertify()).error("Could not start social login.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex flex-1 flex-row mt-3 gap-6 w-full items-center justify-center">
        <PrimaryButton 
          variant="outlined" 
          disabled={ loading ? true : false } 
          startIcon={ loading === "oauth_google" ? <CircularProgress size={17} /> : <FcGoogle /> } 
          onClick={ () => authenticateWith('oauth_google') }
        >
          Google
        </PrimaryButton>
        <PrimaryButton 
          variant="outlined" 
          disabled={ loading ? true : false } 
          startIcon={ loading === "oauth_github" ? <CircularProgress size={17} /> : <GitHubIcon /> } 
          onClick={ () => authenticateWith('oauth_github') }
        >
          GitHub
        </PrimaryButton>
    </div>
  );
}