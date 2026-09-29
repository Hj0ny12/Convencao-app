"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { api } from "../../../convex/_generated/api";
import { useAdminSessionToken } from "@/components/admin/admin-convex-provider";
import { SpeakerSummary } from "@/components/admin/speaker-summary";
import { Button } from "@/components/ui/button";

export function AdminDashboard() {
  const sessionToken = useAdminSessionToken();
  const summary = useQuery(
    api.admin.summary,
    sessionToken ? { sessionToken } : "skip",
  );
  const eventState = useQuery(api.eventState.get);
  const setAfterUnlocked = useMutation(api.admin.setAfterUnlocked);
  const [pending, setPending] = useState(false);
  const unlocked = eventState?.afterUnlocked ?? false;

  async function toggleAfter() {
    if (!sessionToken || pending) return;
    setPending(true);
    try {
      await setAfterUnlocked({
        sessionToken,
        afterUnlocked: !unlocked,
      });
    } catch {
      toast.error("Não conseguimos concluir esta ação. Tenta novamente.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Admin</h1>
        <div className="flex flex-wrap justify-end gap-x-4 gap-y-1">
          <Link
            href="/entrada"
            className="min-h-11 underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Código QR
          </Link>
          <Link href="/admin/live" className="min-h-11 underline">
            Vista live
          </Link>
          <Link href="/admin/words" className="min-h-11 underline">
            Palavras
          </Link>
          <Link href="/admin/questions" className="min-h-11 underline">
            Moderar perguntas
          </Link>
        </div>
      </div>
      {summary === undefined ? <p>A carregar…</p> : null}
      <p>{unlocked ? "After desbloqueado" : "After bloqueado"}</p>
      <Button
        type="button"
        className="min-h-11"
        disabled={pending || eventState === undefined}
        onClick={toggleAfter}
      >
        {unlocked ? "Bloquear After" : "Desbloquear After"}
      </Button>
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
