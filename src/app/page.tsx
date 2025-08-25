"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { ProtectedGuard } from "@/components/AuthGuard";

export default function Home() {
  return (
    <ProtectedGuard>
      <Content />
    </ProtectedGuard>
  );
}

function Content() {
  const user = useQuery(api.users.getCurrentUser);

  // Show loading while user data is being fetched
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-6">
            Welcome, {user.firstName}! 👋
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-3 text-blue-800">
                Your Profile
              </h2>
              <div className="space-y-2 text-blue-700">
                <p>
                  <strong>Location:</strong> {user.location || "Not specified"}
                </p>
                <p>
                  <strong>Occupation:</strong>{" "}
                  {user.occupation || "Not specified"}
                </p>
                <p>
                  <strong>Experience:</strong>{" "}
                  {user.experienceLevel || "Not specified"}
                </p>
              </div>
            </div>

            <div className="bg-green-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-3 text-green-800">
                Interests
              </h2>
              <div className="flex flex-wrap gap-2">
                {user.interests && user.interests.length > 0 ? (
                  user.interests.map((interest, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                    >
                      {interest}
                    </span>
                  ))
                ) : (
                  <p className="text-green-700">No interests specified</p>
                )}
              </div>
            </div>

            <div className="bg-purple-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-3 text-purple-800">
                Technical Skills
              </h2>
              <div className="flex flex-wrap gap-2"></div>
              {user.technicalSkills && user.technicalSkills.length > 0 ? (
                user.technicalSkills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <p className="text-purple-700">No technical skills specified</p>
              )}
            </div>
          </div>
        </div>

        {user.bio && (
          <div className="mt-6 bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-3">About You</h2>
            <p className="text-gray-700">{user.bio}</p>
          </div>
        )}
      </div>
    </div>
  );
}
