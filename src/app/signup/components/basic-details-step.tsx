"use client";

import { useEffect } from "react";
import { useMutation } from "convex/react";
import { useForm } from "react-hook-form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Upload, Github, Linkedin, Globe } from "lucide-react";
import { COLORS, primaryGradient } from "../types";
import { Doc } from "../../../../convex/_generated/dataModel";
import { api } from "../../../../convex/_generated/api";
import { BasicProfileFields } from "@/types/user";
import { Button } from "@/components/ui/button";
import { SignupStep } from "../types";
interface BasicDetailsStepProps {
  profileData: Doc<"users">;
  nextStep: () => void;
  backStep: () => void;
}

export function BasicDetailsStep({
  profileData,
  nextStep,
  backStep,
}: BasicDetailsStepProps) {
  const updateProfileData = useMutation(api.users.updateProfileData);
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    watch,
    setValue,
    reset,
  } = useForm<BasicProfileFields>({
    defaultValues: {
      firstName: "",
      lastName: "",
      imageUrl: "",
      socialMedia: { github: "", linkedin: "", website: "" },
    },
    mode: "onBlur",
  });

  // Initialize form values from profile
  useEffect(() => {
    if (!profileData) return;
    reset({
      firstName: profileData.firstName || "",
      lastName: profileData.lastName || "",
      imageUrl: profileData.imageUrl || "",
      socialMedia: {
        github: profileData.socialMedia?.github || "",
        linkedin: profileData.socialMedia?.linkedin || "",
        website: profileData.socialMedia?.website || "",
      },
    });
  }, [profileData, reset]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setValue("imageUrl", (e.target?.result as string) || "", {
          shouldDirty: true,
          shouldValidate: false,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = handleSubmit(async (values: BasicProfileFields) => {
    await updateProfileData({
      ...values,
      profileCompletionStep: SignupStep.INTERESTS,
    });
    reset(values);
    nextStep();
  });

  return (
    <form className="space-y-6" onSubmit={onSubmit}>
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2" style={{ color: COLORS.fg }}>
          Basic Details
        </h2>
        <p className="text-black/60">Let&apos;s start with the essentials</p>
      </div>

      {/* Profile Picture */}
      <div className="text-center">
        <div className="relative inline-block">
          <Avatar
            className="h-24 w-24 ring-4"
            style={{ boxShadow: `0 0 0 3px #fff`, border: "3px solid #fff" }}
          >
            <AvatarImage
              src={watch("imageUrl") || profileData.imageUrl}
              alt=""
            />
            <AvatarFallback className="text-2xl">
              {(watch("firstName") || profileData.firstName || "").slice(0, 1)}
              {(watch("lastName") || profileData.lastName || "").slice(0, 1)}
            </AvatarFallback>
          </Avatar>
          <label className="absolute -bottom-2 -right-2 cursor-pointer">
            <div
              className="h-8 w-8 rounded-full flex items-center justify-center"
              style={{ background: primaryGradient }}
            >
              <Upload className="h-4 w-4 text-white" />
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
        <p className="text-sm text-black/50 mt-2">
          Click to upload profile picture (optional)
        </p>
      </div>
      {/* Email (read-only) */}
      <div>
        <label
          className="block text-sm font-medium mb-2"
          style={{ color: COLORS.fg }}
        >
          Email
        </label>
        <Input
          value={profileData.email}
          disabled
          className="h-11 bg-gray-100 cursor-not-allowed"
        />
      </div>
      {/* Name Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: COLORS.fg }}
          >
            First Name *
          </label>
          <Input
            placeholder="Enter your first name"
            className={`h-11 ${errors.firstName ? "border-red-500" : ""}`}
            {...register("firstName", { required: "First name is required" })}
          />
        </div>
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: COLORS.fg }}
          >
            Last Name *
          </label>
          <Input
            placeholder="Enter your last name"
            className={`h-11 ${errors.lastName ? "border-red-500" : ""}`}
            {...register("lastName", { required: "Last name is required" })}
          />
        </div>
      </div>

      {/* Social Media Links */}
      <div>
        <label
          className="block text-sm font-medium mb-3"
          style={{ color: COLORS.fg }}
        >
          Social Media Links (Optional)
        </label>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Github className="h-5 w-5 text-black/60" />
            <Input
              placeholder="GitHub username or URL"
              className="h-10"
              {...register("socialMedia.github")}
            />
          </div>
          <div className="flex items-center gap-3">
            <Linkedin className="h-5 w-5 text-black/60" />
            <Input
              placeholder="LinkedIn profile URL"
              className="h-10"
              {...register("socialMedia.linkedin")}
            />
          </div>
          <div className="flex items-center gap-3">
            <Globe className="h-5 w-5 text-black/60" />
            <Input
              placeholder="Personal website URL"
              className="h-10"
              {...register("socialMedia.website")}
            />
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          className="px-6"
          disabled={true}
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
