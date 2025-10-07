"use client";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";

export default function Navbar() {
  return (
    <div className="border-b border-custom-border bg-custom-dark-nav">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-white font-semibold text-lg">Head Start</span>
          </div>

          <div className="flex items-center space-x-3">
            <SignedOut>
              <SignInButton>
                <button className="text-white hover:text-custom-accent transition-colors font-medium text-sm">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton fallbackRedirectUrl="/signup-progress">
                <button className="bg-custom-primary hover:bg-custom-primary-dark text-white rounded-full font-medium text-sm h-8 px-4 transition-colors">
                  Sign Up
                </button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>
        </div>
      </div>
    </div>
  );
}
