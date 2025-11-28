import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import type { Doc } from "../../convex/_generated/dataModel";


export function ProfileCard({ user }: { user: Doc<"users"> }) {
  const primaryGradient = "linear-gradient(135deg,#6366f1 0%,#22d3ee 100%)";

  const updateProfileData = useMutation(api.users.updateProfileData);

  // -----------------------------
  // Editing state
  // -----------------------------
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    location: "",
    occupation: "",
    experienceLevel: "",
  });

  // Load user's existing data into form
  useEffect(() => {
    setForm({
      location: (user as any).location ?? "",
      occupation: (user as any).occupation ?? "",
      experienceLevel: (user as any).experienceLevel ?? "",
    });
  }, [user]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    await updateProfileData({
      location: form.location || undefined,
      occupation: form.occupation || undefined,
      experienceLevel: form.experienceLevel || undefined,
    });

    setIsEditing(false);
  };

  // -----------------------------
  // ACTUAL UI HERE
  // -----------------------------
  return (
    <Card
      className="rounded-2xl"
      style={{
        backgroundColor: "#fff",
        borderColor: "#e5e7eb",
        boxShadow: "0 1px 0 rgba(0,0,0,0.02)",
      }}
    >
      <CardContent className="p-5">
        <div
          className="mb-10 h-16 w-full rounded-xl"
          style={{ background: primaryGradient }}
        />
        <div className="relative -mt-12 flex items-center justify-center">
          <Avatar
            className="h-16 w-16 ring-4"
            style={{ boxShadow: "0 0 0 3px #fff", border: "3px solid #fff" }}
          >
            <AvatarImage src={user.imageUrl ?? undefined} alt="" />
            <AvatarFallback>
              {(user.firstName ?? "").slice(0, 2)}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* NAME */}
        <div className="mt-4 text-center">
          <div className="font-semibold" style={{ color: "#111827" }}>
            {String(user.firstName)} {String(user.lastName)}
          </div>

          {/* EDIT BUTTON */}
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="mt-2 text-sm px-3 py-1 rounded-md bg-indigo-500 text-white hover:bg-indigo-600"
            >
              Edit Profile
            </button>
          )}
        </div>

        {/* INFO SECTION */}
        <div className="mt-5 text-center">
          {!isEditing ? (
            // -----------------------------
            // READ ONLY VIEW
            // -----------------------------
            <div className="space-y-2 text-gray-700">
              <p>
                <strong>Location:</strong>{" "}
                {(user as any).location || "Not specified"}
              </p>
              <p>
                <strong>Occupation:</strong>{" "}
                {(user as any).occupation || "Not specified"}
              </p>
              <p>
                <strong>Experience:</strong>{" "}
                {(user as any).experienceLevel || "Not specified"}
              </p>
            </div>
          ) : (
            // -----------------------------
            // EDIT MODE VIEW
            // -----------------------------
            <div className="space-y-3">
              <input
                name="location"
                value={form.location}
                onChange={handleChange}
                className="w-full rounded-md border px-3 py-2"
                placeholder="Enter location"
              />

              <input
                name="occupation"
                value={form.occupation}
                onChange={handleChange}
                className="w-full rounded-md border px-3 py-2"
                placeholder="Enter occupation"
              />

              <input
                name="experienceLevel"
                value={form.experienceLevel}
                onChange={handleChange}
                className="w-full rounded-md border px-3 py-2"
                placeholder="Experience level"
              />

              <div className="flex justify-center gap-3 pt-2">
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Save
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border rounded-md"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
