"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAdminSessionToken } from "@/components/admin/admin-convex-provider";
import { ModerationList } from "@/components/admin/moderation-list";

export function AdminQuestions() {
  const sessionToken = useAdminSessionToken();
  const groups = useQuery(
    api.admin.moderation,
    sessionToken ? { sessionToken } : "skip",
  );

  return (
    <div className="flex flex-col gap-4">
      <Link href="/admin" className="min-h-11 underline">
        Resumo
      </Link>
      <h1 className="text-2xl font-semibold">Perguntas</h1>
      {groups === undefined ? <p>A carregar…</p> : null}
      {groups ? <ModerationList groups={groups} /> : null}
    </div>
  );
}
