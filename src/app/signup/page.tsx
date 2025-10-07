"use client";

import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AuthOnlyGuard } from "@/components/AuthGuard";
import { BasicDetailsStep } from "./components/basic-details-step";
import { InterestsStep } from "./components/interests-step";
import { TechnicalSkillsStep } from "./components/technical-skills-step";
import { COLORS, primaryGradient } from "./types";
import { SignupStep } from "./types";

const steps: SignupStep[] = [
  SignupStep.BASIC,
  SignupStep.INTERESTS,
  SignupStep.TECHNICAL_SKILLS,
  SignupStep.COMPLETE,
];

export default function SignupPage() {
  return (
    <AuthOnlyGuard>
      <SignupContent />
    </AuthOnlyGuard>
  );
}

function SignupContent() {
  const router = useRouter();
  const user = useQuery(api.users.getCurrentUser);
  const [currentStep, setCurrentStep] = useState<SignupStep>(SignupStep.BASIC);

  useEffect(() => {
    if (user?.profileCompletionStep) {
      setCurrentStep(user.profileCompletionStep as SignupStep);
    }
  }, [user]);

  const nextStep = () => {
    setCurrentStep(steps[steps.indexOf(currentStep) + 1]);
  };

  const prevStep = () => {
    if (currentStep !== SignupStep.BASIC) {
      setCurrentStep(steps[steps.indexOf(currentStep) - 1]);
    }
  };

  const getStepProgress = () => {
    const currentIndex = steps.indexOf(currentStep);
    return ((currentIndex + 1) / steps.length) * 100;
  };
  const renderStepContent = () => {
    switch (currentStep) {
      case SignupStep.BASIC:
        return (
          <BasicDetailsStep
            profileData={user!}
            nextStep={nextStep}
            backStep={prevStep}
          />
        );
      case SignupStep.INTERESTS:
        return (
          <InterestsStep
            profileData={user!}
            nextStep={nextStep}
            backStep={prevStep}
          />
        );
      case SignupStep.TECHNICAL_SKILLS:
        return (
          <TechnicalSkillsStep
            profileData={user!}
            nextStep={nextStep}
            backStep={prevStep}
          />
        );
      case SignupStep.COMPLETE:
        return (
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold" style={{ color: COLORS.fg }}>
              Profile Complete!
            </h2>
            <p className="text-black/60">
              Your profile has been successfully created.
            </p>
            <Button
              onClick={() => router.push("/")}
              className="px-6"
              style={{ background: primaryGradient, color: "#fff" }}
            >
              Go to Dashboard
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <main className="min-h-screen" style={{ backgroundColor: COLORS.bg }}>
      <div className="mx-auto w-full max-w-4xl px-4 py-8 md:px-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: COLORS.fg }}>
            Complete Your Profile
          </h1>
          <p className="text-lg text-black/60">
            Let&apos;s get to know you better to personalize your experience
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-black/70">Progress</span>
            <span
              className="text-sm font-medium"
              style={{ color: COLORS.primary }}
            >
              {Math.round(getStepProgress())}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all duration-500"
              style={{
                width: `${getStepProgress()}%`,
                background: primaryGradient,
              }}
            />
          </div>
        </div>

        {/* Step Content */}
        <Card className="rounded-2xl shadow-lg">
          <CardContent className="p-8">{renderStepContent()}</CardContent>
        </Card>
      </div>
    </main>
  );
}
