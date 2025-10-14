"use client";

import { useState } from "react";

import * as SignIn from "@clerk/elements/sign-in";
import * as SignUp from "@clerk/elements/sign-up";
import * as Common from "@clerk/elements/common";

import Logo from "@/components/ui/logo";
import PrimaryButton from "./ui/primarybutton";

import AuthForm from "./auth/AuthForm";

export default function LandingPage() {
  const [page, setPage] = useState<"signIn" | "signUp" | "forgotPassword">(
    "signIn"
  );

  return (
    <div className="min-h-screen">
      <div className="flex flex-col md:flex-col lg:flex-row-reverse p-6 gap-6 md:items-center lg:items-stretch min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* ============== INPUT AREA ============== */}
        <div className="flex-1 w-full">
          <div className="flex h-13">
            <Logo variant={"full"} />
          </div>
          <div className="md:flex md:justify-center">
            <div className="mt-14 md:w-3/5 lg:w-4/5">
              {/* ============== SIGN IN ============== */}
              {page === "signIn" && (
                <>
                  <h1 className="text-custom-fg text-3xl font-black">
                    Welcome back!
                  </h1>
                  <span className="text-custom-fg text-base font-medium">
                    Sign in to your Headstart account.
                  </span>
                  <SignIn.Root>
                    <SignIn.Step name="start" asChild>
                      <div className="mt-14 flex flex-col justify-center items-center">
                        <AuthForm mode="signIn" setPage={setPage} />
                        {/* <div className="w-full mt-6">
                          <div className="flex flex-1 flex-row gap-6 w-full items-center justify-center">
                            <div className="border-1 border-custom-fg w-full"></div>
                            <p className="w-full text-center text-custom-fg text-base font-medium">or continue with</p>
                            <div className="border-1 border-custom-fg w-full"></div>
                          </div>
                          <div className="flex flex-1 flex-row mt-3 gap-6 w-full items-center justify-center">
                            <Common.Connection name="google" asChild>
                              <PrimaryButton variant="outlined" startIcon={ <FcGoogle /> }>Google</PrimaryButton>
                            </Common.Connection>
                            <Common.Connection name="github" asChild>
                              <PrimaryButton variant="outlined" startIcon={ <GitHubIcon /> }>GitHub</PrimaryButton>
                            </Common.Connection>
                          </div>
                        </div> */}
                      </div>
                    </SignIn.Step>
                  </SignIn.Root>

                  <p className="mt-14 text-center text-custom-fg text-base font-medium">
                    Don&apos;t have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setPage("signUp")}
                      className="text-custom-primary font-extrabold hover:underline focus:outline-none focus:ring-2 focus:ring-custom-primary cursor-pointer"
                    >
                      Sign Up
                    </button>
                  </p>
                </>
              )}

              {/* ============== SIGN UP ============== */}
              {page === "signUp" && (
                <>
                  <div className="flex gap-2">
                    <h1 className="text-custom-fg text-3xl font-black">
                      Welcome to
                    </h1>
                    <div className="flex h-10">
                      <Logo variant={"wordmark"} />
                    </div>
                  </div>
                  <span className="text-custom-fg text-base font-medium">
                    We are pleased to have you join us.
                  </span>
                  <SignUp.Root>
                    <SignUp.Step name="start" asChild>
                      <div className="mt-14 flex flex-col justify-center items-center">
                        <AuthForm mode="signUp" setPage={setPage} />
                        {/* <div className="w-full mt-6">
                            <div className="flex flex-1 flex-row gap-6 w-full items-center justify-center">
                              <div className="border-1 border-custom-fg w-full"></div>
                              <p className="w-full text-center text-custom-fg text-base font-medium">or continue with</p>
                              <div className="border-1 border-custom-fg w-full"></div>
                            </div>
                            <div className="flex flex-1 flex-row mt-3 gap-6 w-full items-center justify-center">
                              <Common.Connection name="google" asChild>
                                <PrimaryButton variant="outlined" startIcon={ <FcGoogle /> }>Google</PrimaryButton>
                              </Common.Connection>
                              <Common.Connection name="github" asChild>
                                <PrimaryButton variant="outlined" startIcon={ <GitHubIcon /> }>GitHub</PrimaryButton>
                              </Common.Connection>
                            </div>
                          </div> */}
                      </div>
                    </SignUp.Step>
                  </SignUp.Root>
                  <p className="mt-14 text-center text-custom-fg text-base font-medium">
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setPage("signIn")}
                      className="text-custom-primary font-extrabold hover:underline focus:outline-none focus:ring-2 focus:ring-custom-primary cursor-pointer"
                    >
                      Sign In
                    </button>
                  </p>
                </>
              )}

              {/* ============== FORGOT PASSWORD ============== */}
              {page === "forgotPassword" && (
                <>
                  <h1 className="text-custom-fg text-3xl font-black">
                    Forgot your password?
                  </h1>
                  <span className="text-custom-fg text-base font-medium">
                    Enter your email and we can help you recover your account.
                  </span>
                  <div className="mt-14 flex flex-col justify-center items-center"></div>
                  <p className="text-center text-custom-fg text-base font-medium">
                    Remembered your password?{" "}
                    <button
                      type="button"
                      onClick={() => setPage("signIn")}
                      className="text-custom-primary font-extrabold hover:underline focus:outline-none focus:ring-2 focus:ring-custom-primary cursor-pointer"
                    >
                      Sign In
                    </button>
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ============== CAROUSEL ============== */}
        <div className="flex-1 md:w-3/5 lg:w-full">carousel</div>
      </div>

      {/* ============== FOOTER ============== */}
      <div className="flex flex-col-reverse lg:flex-row p-6 gap-4 bg-custom-nav font-medium justify-center text-center">
        <span className="text-white text-base">
          Headstart &copy; {new Date().getFullYear()}
        </span>
        <div className="flex flex-wrap space-x-4 space-y-2 lg:space-y-0 justify-center [&>a]:whitespace-nowrap">
          <a
            href="#"
            className="text-white text-base hover:underline hover:text-custom-accent focus:outline-none focus:ring-2 focus:ring-custom-accent"
            aria-label="Go to about page"
          >
            About
          </a>
          <a
            href="#"
            className="text-white text-base hover:underline hover:text-custom-accent focus:outline-none focus:ring-2 focus:ring-custom-accent"
            aria-label="Go to accessibility page"
          >
            Accessibility
          </a>
          <a
            href="#"
            className="text-white text-base hover:underline hover:text-custom-accent focus:outline-none focus:ring-2 focus:ring-custom-accent"
            aria-label="Go to cookie policy page"
          >
            Cookie Policy
          </a>
          <a
            href="#"
            className="text-white text-base hover:underline hover:text-custom-accent focus:outline-none focus:ring-2 focus:ring-custom-accent"
            aria-label="Go to copyright policy page"
          >
            Copyright Policy
          </a>
          <a
            href="#"
            className="text-white text-base hover:underline hover:text-custom-accent focus:outline-none focus:ring-2 focus:ring-custom-accent"
            aria-label="Go to privacy policy page"
          >
            Privacy Policy
          </a>
          <a
            href="#"
            className="text-white text-base hover:underline hover:text-custom-accent focus:outline-none focus:ring-2 focus:ring-custom-accent"
            aria-label="Go to terms of service page"
          >
            Terms of Service
          </a>
          <a
            href="#"
            className="text-white text-base hover:underline hover:text-custom-accent focus:outline-none focus:ring-2 focus:ring-custom-accent"
            aria-label="Go to help centre page"
          >
            Help Centre
          </a>
        </div>
      </div>
    </div>
  );
}
