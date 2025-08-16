"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AuthOnlyGuard } from "@/components/AuthGuard";

const experienceLevels = ["Beginner", "Intermediate", "Advanced", "Expert"];

const commonInterests = [
  "Web Development",
  "Mobile Development",
  "Data Science",
  "Machine Learning",
  "UI/UX Design",
  "DevOps",
  "Cybersecurity",
  "Game Development",
  "Blockchain",
  "Cloud Computing",
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
  const completeProfile = useMutation(api.users.completeProfile);
  const updateProfileStep = useMutation(api.users.updateProfileStep);

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    bio: "",
    interests: [] as string[],
    location: "",
    occupation: "",
    experienceLevel: "",
  });

  // Set initial step from user data if available
  useEffect(() => {
    if (user?.profileCompletionStep !== undefined) {
      setCurrentStep(user.profileCompletionStep);
    }
  }, [user?.profileCompletionStep]);

  // Show loading while user data is being fetched
  if (user === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If user has completed profile, redirect will happen in AuthGuard
  if (user?.profileCompleted) {
    return null;
  }

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleInterestToggle = (interest: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const handleNext = async () => {
    if (currentStep < 3) {
      await updateProfileStep({ step: currentStep + 1 });
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = async () => {
    if (currentStep > 0) {
      await updateProfileStep({ step: currentStep - 1 });
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      await completeProfile(formData);
      router.push("/");
    } catch (error) {
      console.error("Error completing profile:", error);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                Tell us about yourself
              </h2>
              <p className="text-gray-600">Let's start with the basics</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Bio</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => handleInputChange("bio", e.target.value)}
                  placeholder="Tell us a bit about yourself..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) =>
                    handleInputChange("location", e.target.value)
                  }
                  placeholder="Where are you located?"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                Professional Background
              </h2>
              <p className="text-gray-600">
                Help us understand your experience level
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Occupation
                </label>
                <input
                  type="text"
                  value={formData.occupation}
                  onChange={(e) =>
                    handleInputChange("occupation", e.target.value)
                  }
                  placeholder="What do you do?"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Experience Level
                </label>
                <select
                  value={formData.experienceLevel}
                  onChange={(e) =>
                    handleInputChange("experienceLevel", e.target.value)
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select your experience level</option>
                  {experienceLevels.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Interests & Skills</h2>
              <p className="text-gray-600">
                Select the areas that interest you most
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-4">
                Select your interests (choose multiple)
              </label>
              <div className="grid grid-cols-2 gap-3">
                {commonInterests.map((interest) => (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => handleInterestToggle(interest)}
                    className={`p-3 text-left rounded-lg border transition-colors ${
                      formData.interests.includes(interest)
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Review & Complete</h2>
              <p className="text-gray-600">
                Review your information before we finish
              </p>
            </div>

            <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
              <div>
                <span className="font-medium">Bio:</span>
                <p className="text-gray-600">
                  {formData.bio || "Not provided"}
                </p>
              </div>
              <div>
                <span className="font-medium">Location:</span>
                <p className="text-gray-600">
                  {formData.location || "Not provided"}
                </p>
              </div>
              <div>
                <span className="font-medium">Occupation:</span>
                <p className="text-gray-600">
                  {formData.occupation || "Not provided"}
                </p>
              </div>
              <div>
                <span className="font-medium">Experience Level:</span>
                <p className="text-gray-600">
                  {formData.experienceLevel || "Not provided"}
                </p>
              </div>
              <div>
                <span className="font-medium">Interests:</span>
                <p className="text-gray-600">
                  {formData.interests.length > 0
                    ? formData.interests.join(", ")
                    : "None selected"}
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">
                Step {currentStep + 1} of 4
              </span>
              <span className="text-sm text-gray-600">
                {Math.round(((currentStep + 1) / 4) * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / 4) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Step Content */}
          {renderStep()}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <Button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              variant="outline"
              className={currentStep === 0 ? "invisible" : ""}
            >
              Previous
            </Button>

            <div className="ml-auto">
              {currentStep < 3 ? (
                <Button onClick={handleNext}>Next</Button>
              ) : (
                <Button onClick={handleSubmit}>Complete Profile</Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
