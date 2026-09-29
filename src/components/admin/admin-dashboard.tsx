"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAdminSessionToken } from "@/components/admin/admin-convex-provider";
import { SpeakerSummary } from "@/components/admin/speaker-summary";

export function AdminDashboard() {
  const sessionToken = useAdminSessionToken();
  const summary = useQuery(
    api.admin.summary,
    sessionToken ? { sessionToken } : "skip",
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Admin</h1>
        <Link href="/admin/questions" className="min-h-11 underline">
          Moderar perguntas
        </Link>
      </div>
      {summary === undefined ? <p>A carregar…</p> : null}
      {summary?.map((speaker) => (
        <SpeakerSummary
          key={speaker.slug}
          name={speaker.name}
          questionCount={speaker.questionCount}
          voteCount={speaker.voteCount}
        />
      ))}
    </div>
  );
}
