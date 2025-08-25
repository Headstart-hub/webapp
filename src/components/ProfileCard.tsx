import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Doc } from "../../convex/_generated/dataModel";

export function ProfileCard({ user }: { user: Doc<"users"> }) {
  const primaryGradient = "linear-gradient(135deg,#6366f1 0%,#22d3ee 100%)";

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
        <div className="mt-4 text-center">
          <div className="font-semibold" style={{ color: "#111827" }}>
            {String(user.firstName)} {String(user.lastName)}
          </div>
        </div>
        <div className="mt-5 grid grid-cols-3 items-center text-center">
          {[
            { label: "Projects", value: 1234 },
            { label: "Followers", value: 1234 },
            { label: "Following", value: 1234 },
          ].map((s) => (
            <div key={s.label}>
              <div
                className="text-base font-semibold"
                style={{ color: "#111827" }}
              >
                {s.value}
              </div>
              <div className="text-[11px]" style={{ color: "#6366f1" }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
