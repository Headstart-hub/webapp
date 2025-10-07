"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { useForm } from "react-hook-form";

interface NewProjectModalProps {
  open: boolean;
  onClose: () => void;
  onCreated?: (projectId: Id<"projects">) => void;
}

export function NewProjectModal({
  open,
  onClose,
  onCreated,
}: NewProjectModalProps) {
  const [error, setError] = useState<string | null>(null);

  const createProject = useMutation(api.projects.createProject);

  type FormValues = { name: string; description?: string };
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ defaultValues: { name: "", description: "" } });

  if (!open) return null;

  async function onSubmit(values: FormValues) {
    setError(null);
    try {
      const projectId = await createProject({
        name: values.name.trim(),
        description: values.description?.trim() || undefined,
      });
      onCreated?.(projectId);
      reset();
      onClose();
    } catch (err: unknown) {
      const message = typeof err === "object" && err && "message" in err
        ? String((err as { message?: unknown }).message || "Failed to create project")
        : "Failed to create project";
      setError(message);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-xl bg-white shadow-lg">
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold">New Project</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="p-5">
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Name
              </label>
              <Input
                placeholder="Project name"
                disabled={isSubmitting}
                {...register("name", { required: "Project name is required" })}
              />
              {errors.name ? (
                <p className="mt-1 text-xs text-red-600">
                  {errors.name.message}
                </p>
              ) : null}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                placeholder="Brief description (optional)"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows={4}
                disabled={isSubmitting}
                {...register("description")}
              />
            </div>
            {error ? <div className="text-sm text-red-600">{error}</div> : null}
          </div>
          <div className="mt-5 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="h-9"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-9 text-white bg-primary-gradient"
            >
              {isSubmitting ? "Creating…" : "Create Project"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
