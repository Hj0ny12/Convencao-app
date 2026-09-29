"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { toast } from "sonner";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";

export function VoteButton({
  questionId,
  voteCount,
  votedByMe,
  speakerSlug,
  deviceId,
  disabled,
}: {
  questionId: Id<"questions">;
  voteCount: number;
  votedByMe: boolean;
  speakerSlug: string;
  deviceId: string | null;
  disabled: boolean;
}) {
  const queryArgs = {
    speakerSlug,
    deviceId: deviceId ?? undefined,
  };
  const [pending, setPending] = useState(false);
  const [burst, setBurst] = useState<"+1" | "-1" | null>(null);

  const cast = useMutation(api.votes.cast).withOptimisticUpdate((localStore) => {
    const current = localStore.getQuery(api.questions.listBySpeaker, queryArgs);
    if (!current) return;
    const next = current
      .map((question) =>
        question._id === questionId
          ? {
              ...question,
              votedByMe: true,
              voteCount: question.voteCount + (votedByMe ? 0 : 1),
            }
          : question,
      )
      .sort((a, b) => b.voteCount - a.voteCount || a.createdAt - b.createdAt);
    localStore.setQuery(api.questions.listBySpeaker, queryArgs, next);
  });
  const remove = useMutation(api.votes.remove).withOptimisticUpdate(
    (localStore) => {
      const current = localStore.getQuery(
        api.questions.listBySpeaker,
        queryArgs,
      );
      if (!current) return;
      const next = current
        .map((question) =>
          question._id === questionId
            ? {
                ...question,
                votedByMe: false,
                voteCount: question.voteCount + (votedByMe ? -1 : 0),
              }
            : question,
        )
        .sort((a, b) => b.voteCount - a.voteCount || a.createdAt - b.createdAt);
      localStore.setQuery(api.questions.listBySpeaker, queryArgs, next);
    },
  );

  async function onPress() {
    if (!deviceId || disabled || pending) return;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    setPending(true);
    if (!reduced) setBurst(votedByMe ? "-1" : "+1");
    try {
      if (votedByMe) {
        await remove({ questionId, deviceId });
      } else {
        await cast({ questionId, deviceId });
      }
    } catch {
      toast.error("Não conseguimos concluir esta ação. Tenta novamente.");
    } finally {
      setPending(false);
      window.setTimeout(() => setBurst(null), 400);
    }
  }

  return (
    <div className="relative">
      <Button
        type="button"
        variant={votedByMe ? "default" : "outline"}
        aria-pressed={votedByMe}
        aria-label={`Votar, ${voteCount} votos`}
        disabled={disabled || pending || !deviceId}
        onClick={onPress}
        className="min-h-11 min-w-24 tabular-nums"
      >
        ▲ {voteCount}
      </Button>
      {burst ? (
        <span className="pointer-events-none absolute -top-1 left-12 text-xs motion-safe:animate-[fade-up_400ms_ease-out] motion-reduce:hidden">
          {burst}
        </span>
      ) : null}
    </div>
  );
}
