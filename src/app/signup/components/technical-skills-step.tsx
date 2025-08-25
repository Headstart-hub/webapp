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

interface TechnicalSkillsStepProps {
  profileData: Doc<"users">;
  nextStep: () => void;
  backStep: () => void;
}

const CATEGORY_TO_SUBSKILLS: Record<string, string[]> = {
  "Front-End Development": ["React", "Vue", "HTML/CSS/JS"],
  "Back-End Development": ["APIs", "Databases", "Server-side"],
  "Mobile Development": ["iOS", "Android", "Flutter", "React Native"],
  "Data Science & Machine Learning": ["Python", "R", "TensorFlow", "PyTorch"],
  "UI/UX Design": ["Figma", "Prototyping", "User Flows"],
  "Database Management": ["SQL", "NoSQL", "Schema Design"],
  "DevOps & Cloud": ["AWS", "GCP", "Docker", "CI/CD"],
  Cybersecurity: ["App Security", "Encryption", "Authentication"],
  "Blockchain / Smart Contracts": ["Ethereum", "Solidity", "Web3"],
};

const CATEGORIES = Object.keys(CATEGORY_TO_SUBSKILLS);

type FormData = {
  technicalSkills: string[];
};

export function TechnicalSkillsStep({
  profileData,
  nextStep,
  backStep,
}: TechnicalSkillsStepProps) {
  const updateProfileData = useMutation(api.users.updateProfileData);

  const { handleSubmit, setValue, watch, reset } = useForm<FormData>({
    defaultValues: { technicalSkills: [] },
  });

  const selected = watch("technicalSkills") || [];
  const [otherValue, setOtherValue] = useState("");

  // Initialize from profile
  useEffect(() => {
    if (!profileData) return;
    const existing = (profileData.technicalSkills as string[]) || [];
    reset({ technicalSkills: existing });
  }, [profileData, reset]);

  const isSelected = (token: string) => selected.includes(token);

  const toggleToken = (token: string, checked: boolean) => {
    const current = selected || [];
    const next = checked
      ? [...current, token]
      : current.filter((t) => t !== token);
    setValue("technicalSkills", next, { shouldDirty: true });
  };

  const handleOtherCommit = () => {
    const t = otherValue.trim();
    if (!t) return;
    if (!isSelected(t)) {
      setValue("technicalSkills", [...selected, t], { shouldDirty: true });
    }
    setOtherValue("");
  };

  const onUploadCv = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type === "text/plain") {
      const text = await file.text();
      const lower = text.toLowerCase();
      const additions: string[] = [];

      for (const category of CATEGORIES) {
        const subs = CATEGORY_TO_SUBSKILLS[category];
        let matchedCategory = false;
        for (const sub of subs) {
          const variants = [sub, ...sub.split(/\W+/)].filter(Boolean);
          if (variants.some((v) => lower.includes(v.toLowerCase()))) {
            additions.push(`${category}: ${sub}`);
            matchedCategory = true;
          }
        }
        if (matchedCategory) additions.push(category);
      }

      const merged = Array.from(new Set([...selected, ...additions]));
      setValue("technicalSkills", merged, { shouldDirty: true });
    }

    e.currentTarget.value = "";
  };

  const onSubmit = handleSubmit(async (values: FormData) => {
    await updateProfileData({
      technicalSkills: values.technicalSkills,
      profileCompletionStep: SignupStep.COMPLETE,
    });
    nextStep();
  });

  return (
    <form className="space-y-6" onSubmit={onSubmit}>
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2" style={{ color: COLORS.fg }}>
          Technical Skills
        </h2>
        <p className="text-black/60">
          Select applicable categories and optional specifics
        </p>
      </div>

      <div className="space-y-4">
        <label
          className="block text-sm font-medium mb-4"
          style={{ color: COLORS.fg }}
        >
          Select Applicable (Optional)
        </label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {CATEGORIES.map((category) => (
            <Checkbox
              key={category}
              id={category}
              label={category}
              checked={isSelected(category)}
              onCheckedChange={(checked) => toggleToken(category, checked)}
            />
          ))}
          <div className="col-span-1 md:col-span-2">
            <Input
              placeholder="Other"
              value={otherValue}
              onChange={(e) => setOtherValue(e.target.value)}
              onBlur={handleOtherCommit}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleOtherCommit();
                }
              }}
              className="h-10"
            />
          </div>
        </div>

        <div className="mt-6 space-y-6">
          {CATEGORIES.filter(isSelected).map((category) => (
            <div key={category} className="border-t border-gray-200 pt-4">
              <p
                className="text-sm font-medium mb-3"
                style={{ color: COLORS.fg }}
              >
                {category} specifics
              </p>
              <div className="flex flex-wrap gap-2">
                {CATEGORY_TO_SUBSKILLS[category].map((sub) => {
                  const token = `${category}: ${sub}`;
                  const active = isSelected(token);
                  return (
                    <button
                      key={token}
                      type="button"
                      onClick={() => toggleToken(token, !active)}
                      className={[
                        "px-3 py-1 rounded-full text-sm border",
                        active
                          ? "bg-blue-600 text-white border-transparent"
                          : "bg-white text-gray-700 border-gray-300 hover:border-gray-400",
                      ].join(" ")}
                    >
                      {sub}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: COLORS.fg }}
          >
            Upload CV (optional, .txt only) — we'll try to prefill
          </label>
          <input type="file" accept=".txt" onChange={onUploadCv} />
        </div>

        {selected.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800 font-medium">
              Selected ({selected.length}):
            </p>
            <p className="text-sm text-blue-600 mt-1 break-words">
              {selected.join(", ")}
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
            Finish
          </Button>
        </div>
      </div>
    </form>
  );
}
