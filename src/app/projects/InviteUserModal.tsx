"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { ConvexError } from "convex/values";

interface InviteUserModalProps {
  open: boolean;
  onClose: () => void;
  projectId: Id<"projects">;
  onInvited?: (result: {
    candidateId: string;
    inviteLink?: string;
    inviteToken: string;
    inviteExpiresAt: number;
  }) => void;
}

export function InviteUserModal({ open, onClose, projectId, onInvited }: InviteUserModalProps) {
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [expiresInDays, setExpiresInDays] = useState<number>(7);

  const sendInvite = useAction(api.projectCandidates.sendDirectInvite);

  if (!open) return null;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const res = await sendInvite({ projectId, email, expiresInDays, origin });
      onInvited?.({
        candidateId: String(res?.candidateId ?? ""),
        inviteToken: String(res?.inviteToken ?? ""),
        inviteExpiresAt: Number(res?.inviteExpiresAt ?? 0),
      });
      setEmail("");
      setExpiresInDays(7);
      onClose();
    } catch (err: unknown) {
      let message = "Failed to send invite";
      
      if (err instanceof ConvexError) {
        // ConvexError can have data as string or object
        if (typeof err.data === "string") {
          message = err.data;
        } else if (err.data && typeof err.data === "object" && "message" in err.data) {
          message = (err.data as { message: string }).message;
        } else {
          // Fallback to error message if data is not a string or doesn't have message
          message = err.message || "Failed to send invite";
        }
      } else if (err instanceof Error) {
        message = err.message;
      }
      
      setError(message);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-xl bg-white shadow-lg">
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Invite User</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>
        <form onSubmit={onSubmit} className="p-5">
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
              <Input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Expiry (days)</label>
              <Input
                type="number"
                min={1}
                value={String(expiresInDays)}
                onChange={(e) => setExpiresInDays(Math.max(1, Number(e.target.value) || 1))}
              />
            </div>
            {error ? (
              <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            ) : null}
          </div>
          <div className="mt-5 flex items-center justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} className="h-9">Cancel</Button>
            <Button type="submit" className="h-9 text-white bg-primary-gradient">Send Invite</Button>
          </div>
        </form>
      </div>
    </div>
  );
}


