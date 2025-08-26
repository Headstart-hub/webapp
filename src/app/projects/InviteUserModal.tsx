"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

interface InviteUserModalProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
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

  const createInvite = useMutation(api.projectCandidates.createDirectInvite);

  if (!open) return null;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const inviteUrlBase = typeof window !== "undefined" ? `${window.location.origin}/invite` : "";
      const res = await createInvite({
        projectId: projectId as any,
        email,
        expiresInDays,
      } as any);
      onInvited?.({
        candidateId: String(res?.candidateId ?? ""),
        inviteToken: String(res?.inviteToken ?? ""),
        inviteExpiresAt: Number(res?.inviteExpiresAt ?? 0),
      });
      setEmail("");
      setExpiresInDays(7);
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to send invite");
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
            {error ? <div className="text-sm text-red-600">{error}</div> : null}
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


