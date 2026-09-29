"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAdminSessionToken } from "@/components/admin/admin-convex-provider";
import { speakers } from "@/lib/speakers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function LiveBoard() {
  const sessionToken = useAdminSessionToken();
  const [slug, setSlug] = useState<(typeof speakers)[number]["slug"]>(
    "maria-corominas",
  );
  const [showAnswered, setShowAnswered] = useState(false);
  const live = useQuery(
    api.admin.liveQuestions,
    sessionToken ? { sessionToken, speakerSlug: slug } : "skip",
  );
  const questions =
    live?.questions.filter(
      (question) => showAnswered || question.status === "visible",
    ) ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-4xl font-semibold tracking-tight">
            {live?.name.toUpperCase() ?? "—"}
          </p>
          <p className="mt-1 text-lg">{live?.sessionStatus}</p>
        </div>
        <Link href="/admin" className="text-sm underline">
          Admin
        </Link>
      </div>
      <div className="flex flex-wrap gap-2">
        {speakers.map((speaker) => (
          <Button
            key={speaker.slug}
            type="button"
            variant={slug === speaker.slug ? "default" : "outline"}
            aria-pressed={slug === speaker.slug}
            className="min-h-11"
            onClick={() => setSlug(speaker.slug)}
          >
            {speaker.name.split(" ")[0]}
          </Button>
        ))}
        <Button
          type="button"
          variant={showAnswered ? "default" : "outline"}
          aria-pressed={showAnswered}
          className="min-h-11"
          onClick={() => setShowAnswered((current) => !current)}
        >
          Mostrar respondidas
        </Button>
      </div>
      {live === undefined ? <p>A carregar…</p> : null}
      {live && questions.length === 0 ? (
        <p className="text-2xl">Ainda não há perguntas visíveis.</p>
      ) : null}
      <ol className="flex flex-col gap-6">
        {questions.map((question, index) => (
          <li key={`${question.text}-${index}`}>
            <p className="text-sm text-muted-foreground">{index + 1}.</p>
            <p className="text-3xl font-semibold tabular-nums">
              ▲ {question.voteCount}
            </p>
            <p className="text-2xl leading-snug">{question.text}</p>
            {question.status === "answered" ? <Badge>answered</Badge> : null}
          </li>
        ))}
      </ol>
    </div>
  );
}
