"use client";

import * as React from "react";
import { useSignIn, useSignUp } from "@clerk/nextjs";
import PrimaryInput from "@/components/ui/primaryinput";
import PrimaryButton from "@/components/ui/primarybutton";
import { OAuthButtons } from "./AuthButtons";
import { FLAGS } from "@/config/featureFlags";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

type Mode = "signIn" | "signUp" | "forgotPassword";

export default function AuthForm({
  mode,
  setPage,
  onSuccess,
}: {
  mode: Mode;
  setPage: React.Dispatch<React.SetStateAction<Mode>>;
  onSuccess?: () => void;
}) {
  const mounted = React.useRef(true);
  React.useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const [submitting, setSubmitting] = React.useState(false);
  const [alertOpen, setAlertOpen] = React.useState(false);
  const [alertTitle, setAlertTitle] = React.useState<string>("");
  const [alertDescription, setAlertDescription] = React.useState<string>("");

  // shared fields
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  // sign-up only
  const [confirmPassword, setConfirmPassword] = React.useState("");

  // email verification
  const [awaitingEmailLink, setAwaitingEmailLink] = React.useState(false);

  // Clerk hooks
  const {
    isLoaded: signInLoaded,
    signIn,
    setActive: setActiveIn,
  } = useSignIn();
  const {
    isLoaded: signUpLoaded,
    signUp,
    setActive: setActiveUp,
  } = useSignUp();

  // Sign in
  async function handleSignIn() {
    if (!signInLoaded) return;
    if (mounted.current) setSubmitting(true);
    try {
      const res = await signIn.create({ identifier: email, password });
      if (res.status === "complete") {
        await setActiveIn({ session: res.createdSessionId });
        setAlertTitle("Signed in");
        setAlertDescription("You have successfully signed in.");
        setAlertOpen(true);
        onSuccess?.();
      } else {
        setAlertTitle("Further verification required");
        setAlertDescription(
          "Please complete the additional verification steps."
        );
        setAlertOpen(true);
      }
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
        "Invalid username or password.";
      setAlertTitle("Sign in failed");
      setAlertDescription(msg);
      setAlertOpen(true);
    } finally {
      if (mounted.current) setSubmitting(false);
    }
  }

  // Sign up
  async function handleSignUp() {
    if (!signUpLoaded) return;

    if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
      setAlertTitle("Missing information");
      setAlertDescription("Please fill in all fields.");
      setAlertOpen(true);
      return;
    }
    if (password !== confirmPassword) {
      setAlertTitle("Passwords do not match");
      setAlertDescription("Please make sure both passwords match.");
      setAlertOpen(true);
      return;
    }

    if (mounted.current) setSubmitting(true);
    try {
      // 1) create the pending sign-up
      const res = await signUp.create({ emailAddress: email, password });

      // DEV/preview mode (flag OFF): don't require email verification
      if (!FLAGS.EMAIL_VERIFICATION_ENABLED) {
        if (res.status === "complete" && res.createdSessionId) {
          await setActiveUp({ session: res.createdSessionId });
          setAlertTitle("Account created");
          setAlertDescription("Your account has been created successfully.");
          setAlertOpen(true);
          onSuccess?.();
          return;
        }

        setAlertTitle("Verification disabled in UI");
        setAlertDescription(
          "Your backend may still require email verification."
        );
        setAlertOpen(true);
        return;
      }

      // 2) PROD (flag ON): send EMAIL LINK
      if (FLAGS.EMAIL_VERIFICATION_ENABLED) {
        const origin =
          typeof window !== "undefined" ? window.location.origin : "";
        await signUp.prepareEmailAddressVerification({
          strategy: "email_link",
          redirectUrl: `${origin}/email-verify`,
        });
        if (mounted.current) {
          setAwaitingEmailLink(true);
          setAlertTitle("Check your email");
          setAlertDescription(
            "We sent a verification link. Click it, then return here."
          );
          setAlertOpen(true);
        }
      }
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
        "Could not create your account.";
      setAlertTitle("Sign up failed");
      setAlertDescription(msg);
      setAlertOpen(true);
    } finally {
      if (mounted.current) setSubmitting(false);
    }
  }

  // Email verification
  async function handleConfirmEmailClicked() {
    if (!signUpLoaded) return;
    if (mounted.current) setSubmitting(true);
    try {
      const refreshed = await signUp.reload();
      if (refreshed.status === "complete") {
        await setActiveUp({ session: refreshed.createdSessionId });
        setAlertTitle("Account created");
        setAlertDescription(
          "Your email has been verified and account created."
        );
        setAlertOpen(true);
        onSuccess?.();
      } else {
        setAlertTitle("Still waiting for verification");
        setAlertDescription("Check your inbox or spam folder and try again.");
        setAlertOpen(true);
      }
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
        "We couldn't confirm your email yet.";
      setAlertTitle("Verification check failed");
      setAlertDescription(msg);
      setAlertOpen(true);
    } finally {
      if (mounted.current) setSubmitting(false);
    }
  }

  // Resend email verification
  async function handleResendLink() {
    if (!signUpLoaded) return;
    if (mounted.current) setSubmitting(true);
    try {
      const origin =
        typeof window !== "undefined" ? window.location.origin : "";
      await signUp.prepareEmailAddressVerification({
        strategy: "email_link",
        redirectUrl: `${origin}/email-verify`,
      });
      setAlertTitle("Verification link sent");
      setAlertDescription(
        "We have re-sent the verification link to your email."
      );
      setAlertOpen(true);
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
        "Unable to resend the link.";
      setAlertTitle("Resend failed");
      setAlertDescription(msg);
      setAlertOpen(true);
    } finally {
      if (mounted.current) setSubmitting(false);
    }
  }

  // Submit router
  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (mode === "signIn") return void handleSignIn();

    if (FLAGS.EMAIL_VERIFICATION_ENABLED && awaitingEmailLink) {
      return void handleConfirmEmailClicked();
    }
    return void handleSignUp();
  }

  const isSignIn = mode === "signIn";
  const isSignUp = mode === "signUp";
  const isForgotPassword = mode === "forgotPassword";

  return (
    <form onSubmit={onSubmit} className="w-full flex flex-col gap-6">
      {FLAGS.EMAIL_VERIFICATION_ENABLED && awaitingEmailLink ? (
        <></>
      ) : (
        <>
          <PrimaryInput
            type="email"
            label="Email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail((e.target as HTMLInputElement).value)}
          />

          {!isForgotPassword && (
            <div className="flex flex-col lg:flex-row gap-6">
              <PrimaryInput
                type="password"
                label="Password"
                placeholder={
                  isSignIn ? "Enter password" : "Create a strong password"
                }
                value={password}
                onChange={(e) =>
                  setPassword((e.target as HTMLInputElement).value)
                }
              />
              {isSignUp && (
                <PrimaryInput
                  type="password"
                  label="Confirm Password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword((e.target as HTMLInputElement).value)
                  }
                />
              )}
            </div>
          )}

          {isSignIn && (
            <div className="flex items-end justify-end">
              <button
                type="button"
                onClick={() => setPage("forgotPassword")}
                className="text-custom-fg font-bold hover:underline focus:outline-none focus:ring-2 focus:ring-custom-primary cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>
          )}

          {isSignUp && (
            <div className="flex items-end justify-start">
              <p className="font-medium text-base color-custom-fg">
                By signing up, you agree to the{" "}
                <button
                  type="button"
                  //   onClick={() => setPage("signUp")}
                  className="text-custom-primary font-extrabold hover:underline focus:outline-none focus:ring-2 focus:ring-custom-primary cursor-pointer"
                >
                  Terms of Service
                </button>{" "}
                and{" "}
                <button
                  type="button"
                  //   onClick={() => setPage("signUp")}
                  className="text-custom-primary font-extrabold hover:underline focus:outline-none focus:ring-2 focus:ring-custom-primary cursor-pointer"
                >
                  Privacy Policy
                </button>
                .
              </p>
            </div>
          )}

          <div className="w-full flex items-center justify-center">
            <PrimaryButton type="submit" loading={submitting}>
              {submitting
                ? isSignIn
                  ? "Signing in…"
                  : "Creating…"
                : isSignIn
                  ? "Sign In"
                  : "Create account"}
            </PrimaryButton>
          </div>

          {!isForgotPassword && (
            <div className="w-full">
              <div className="flex flex-1 flex-row gap-6 w-full items-center justify-center">
                <div className="border-1 border-custom-fg w-full"></div>
                <p className="w-full text-center text-custom-fg text-base font-medium">
                  or continue with
                </p>
                <div className="border-1 border-custom-fg w-full"></div>
              </div>
              <OAuthButtons />
              <div
                className="mt-6"
                id="clerk-captcha"
                data-cl-theme="dark"
                data-cl-size="flexible"
                data-cl-language="en-EN"
              />
            </div>
          )}
        </>
      )}
      {/* Sign-in / Sign-up / Forgot Password shared */}
      {/* {!needsCode && (
        <>
          <PrimaryInput
            type="email"
            label="Email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail((e.target as HTMLInputElement).value)}
          />
          
          {!isForgotPassword && (
            <div className="flex flex-col lg:flex-row gap-6">
                <PrimaryInput
                    type="password"
                    label="Password"
                    placeholder={isSignIn ? "Enter password" : "Create a strong password"}
                    value={password}
                    onChange={(e) => setPassword((e.target as HTMLInputElement).value)}
                />
                {isSignUp && (
                    <PrimaryInput
                        type="password"
                        label="Confirm Password"
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword((e.target as HTMLInputElement).value)}
                    />
                )}
            </div>
          )}

          {isSignIn && (
            <div className="flex items-end justify-end">
                <button
                    type="button"
                    onClick={() => setPage("forgotPassword")}
                    className="text-custom-fg font-bold hover:underline focus:outline-none focus:ring-2 focus:ring-custom-primary cursor-pointer"
                >
                    Forgot Password?
                </button>
            </div>
          )}

          {isSignUp && (
            <div className="flex items-end justify-start">
                <p className="font-medium text-base color-custom-fg">
                    By signing up, you agree to the{" "}
                    <button
                      type="button"
                    //   onClick={() => setPage("signUp")}
                      className="text-custom-primary font-extrabold hover:underline focus:outline-none focus:ring-2 focus:ring-custom-primary cursor-pointer"
                    >
                      Terms of Service
                    </button>
                    {" "}and{" "}
                    <button
                      type="button"
                    //   onClick={() => setPage("signUp")}
                      className="text-custom-primary font-extrabold hover:underline focus:outline-none focus:ring-2 focus:ring-custom-primary cursor-pointer"
                    >
                      Privacy Policy
                    </button>
                    .
                </p>
            </div>
          )}

            <div className="w-full flex items-center justify-center">
                <PrimaryButton type="submit" loading={submitting}>
                {submitting
                    ? isSignIn
                    ? "Signing in…"
                    : needsCode
                    ? "Verifying…"
                    : "Creating…"
                    : isSignIn
                    ? "Sign In"
                    : needsCode
                    ? "Verify"
                    : "Create account"}
                </PrimaryButton>
            </div>

          {!isForgotPassword && (
            <div className="w-full">
                <div className="flex flex-1 flex-row gap-6 w-full items-center justify-center">
                    <div className="border-1 border-custom-fg w-full"></div>
                        <p className="w-full text-center text-custom-fg text-base font-medium">or continue with</p>
                    <div className="border-1 border-custom-fg w-full"></div>
                </div>
                <OAuthButtons />
                <div className="mt-6" id="clerk-captcha" data-cl-theme="dark" data-cl-size="flexible" data-cl-language="en-EN" />
            </div>
          )}

        </>
      )} */}

      {/* Sign-up verification step */}
      {/* {needsCode && (
        <PrimaryInput
          label="Verification code"
          placeholder="6-digit code"
          value={code}
          onChange={(e) => setCode((e.target as HTMLInputElement).value)}
          slotProps={{ input: { inputProps: { inputMode: "numeric", pattern: "[0-9]*" } } }}
        />
      )} */}
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
    </form>
  );
}
