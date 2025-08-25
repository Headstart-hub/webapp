"use client";

import { useEffect, useState } from "react";
import { useMutation } from "convex/react";
import { useForm } from "react-hook-form";
import { COLORS, primaryGradient, SignupStep } from "../types";
import { Doc } from "../../../../convex/_generated/dataModel";
import { api } from "../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

interface InterestsStepProps {
  profileData: Doc<"users">;
  nextStep: () => void;
  backStep: () => void;
}

const INTEREST_OPTIONS = [
  "Web Development",
  "Mobile Apps",
  "Game Development",
  "Artificial Intelligence / Machine Learning",
  "Data Science & Analytics",
  "Cybersecurity",
  "Blockchain / Web3",
  "Cloud Computing",
  "3D Modeling",
  "Biology",
  "Finance & Business",
] as const;

type InterestOption = (typeof INTEREST_OPTIONS)[number];

interface InterestsFormData {
  interests: string[];
}

export function InterestsStep({
  profileData,
  nextStep,
  backStep,
}: InterestsStepProps) {
  const updateProfileData = useMutation(api.users.updateProfileData);
  const { handleSubmit, setValue, watch, reset } = useForm<InterestsFormData>({
    defaultValues: {
      interests: [],
    },
  });

  const selectedInterests = watch("interests") || [];
  const [customInterest, setCustomInterest] = useState("");

  // Initialize form values from profile
  useEffect(() => {
    if (!profileData) return;
    reset({
      interests: (profileData.interests as string[]) || [],
    });
  }, [profileData, reset]);

  const handleInterestToggle = (interest: string, checked: boolean) => {
    const currentInterests = selectedInterests || [];
    let newInterests: string[];

    if (checked) {
      newInterests = [...currentInterests, interest];
    } else {
      newInterests = currentInterests.filter((i) => i !== interest);
    }

    setValue("interests", newInterests, { shouldDirty: true });
  };

  const handleAddCustomInterest = () => {
    const trimmedInterest = customInterest.trim();
    if (trimmedInterest && !selectedInterests.includes(trimmedInterest)) {
      const newInterests = [...selectedInterests, trimmedInterest];
      setValue("interests", newInterests, { shouldDirty: true });
      setCustomInterest("");
    }
  };

  const handleCustomInterestKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddCustomInterest();
    }
  };

  const onSubmit = handleSubmit(async (values: InterestsFormData) => {
    await updateProfileData({
      interests: values.interests,
      profileCompletionStep: SignupStep.TECHNICAL_SKILLS,
    });

    nextStep();
  });

  return (
    <form className="space-y-6" onSubmit={onSubmit}>
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2" style={{ color: COLORS.fg }}>
          Interests
        </h2>
        <p className="text-black/60">Select areas that interest you</p>
      </div>

      {/* Interests Selection */}
      <div className="space-y-4">
        <label
          className="block text-sm font-medium mb-4"
          style={{ color: COLORS.fg }}
        >
          Select Applicable
        </label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {INTEREST_OPTIONS.map((interest) => (
            <Checkbox
              key={interest}
              id={interest}
              label={interest}
              checked={selectedInterests.includes(interest)}
              onCheckedChange={(checked) =>
                handleInterestToggle(interest, checked)
              }
            />
          ))}
          {/* Other input inline without checkbox */}
          <div className="col-span-1 md:col-span-2">
            <Input
              placeholder="Other"
              value={customInterest}
              onChange={(e) => setCustomInterest(e.target.value)}
              onBlur={handleAddCustomInterest}
              onKeyPress={handleCustomInterestKeyPress}
              className="h-10"
            />
          </div>
        </div>

        {/* No extra custom section. Custom values are added inline via Other input */}

        {selectedInterests.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800 font-medium">
              Selected ({selectedInterests.length}):
            </p>
            <p className="text-sm text-blue-600 mt-1">
              {selectedInterests.join(", ")}
            </p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          className="px-6"
          onClick={backStep}
        >
          Back
        </Button>
        <div className="text-right">
          <Button
            type="submit"
            className="px-6"
            style={{ background: primaryGradient, color: "#fff" }}
          >
            Next
          </Button>
        </div>
      </div>
    </form>
  );
}
