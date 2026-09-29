"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { toast } from "sonner";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { useAdminSessionToken } from "@/components/admin/admin-convex-provider";
import { SessionStatusControl } from "@/components/admin/session-status-control";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type Status = "visible" | "hidden" | "answered";

const labels: Record<Status, string> = {
  visible: "visible",
  hidden: "hidden",
  answered: "answered",
};

export function ModerationList({
  groups,
}: {
  groups: {
    slug: string;
    name: string;
    sessionStatus: "OPEN" | "VOTING" | "FINISHED";
    questions: {
      _id: Id<"questions">;
      text: string;
      status: Status;
      voteCount: number;
    }[];
  }[];
}) {
  const sessionToken = useAdminSessionToken();
  const setQuestionStatus = useMutation(api.admin.setQuestionStatus);
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function update(questionId: Id<"questions">, status: Status) {
    if (!sessionToken || pendingId) return;
    setPendingId(questionId);
    try {
      await setQuestionStatus({ sessionToken, questionId, status });
    } catch {
      toast.error("Não conseguimos concluir esta ação. Tenta novamente.");
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      {groups.map((group) => (
        <section key={group.slug} className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold">{group.name}</h2>
          <SessionStatusControl
            speakerSlug={group.slug}
            sessionStatus={group.sessionStatus}
          />
          <ul className="flex flex-col gap-4">
            {group.questions.map((question) => (
              <li key={question._id} className="border-b border-border pb-4">
                <Badge>{labels[question.status]}</Badge>
                <p className="mt-2">{question.text}</p>
                <p className="text-sm tabular-nums">▲ {question.voteCount}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {question.status !== "hidden" ? (
                    <Button
                      type="button"
                      variant="outline"
                      className="min-h-11"
                      disabled={pendingId === question._id}
                      onClick={() => update(question._id, "hidden")}
                    >
                      Ocultar
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      className="min-h-11"
                      disabled={pendingId === question._id}
                      onClick={() => update(question._id, "visible")}
                    >
                      Restaurar
                    </Button>
                  )}
                  {question.status !== "answered" ? (
                    <Button
                      type="button"
                      className="min-h-11"
                      disabled={pendingId === question._id}
                      onClick={() => update(question._id, "answered")}
                    >
                      Marcar como respondida
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      className="min-h-11"
                      disabled={pendingId === question._id}
                      onClick={() => update(question._id, "visible")}
                    >
                      Reabrir
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
