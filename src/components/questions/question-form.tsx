"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { toast } from "sonner";
import { api } from "../../../convex/_generated/api";
import { QUESTION_MAX } from "@/lib/limits";
import { normalizeQuestionText } from "@/lib/text";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function QuestionForm({
  speakerName,
  speakerSlug,
  deviceId,
}: {
  speakerName: string;
  speakerSlug: string;
  deviceId: string | null;
}) {
  const submit = useMutation(api.questions.submit);
  const [value, setValue] = useState("");
  const [pending, setPending] = useState(false);
  const length = value.replace(/[<>]/g, "").trim().length;

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!deviceId || pending) return;
    setPending(true);
    try {
      const text = normalizeQuestionText(value);
      await submit({ speakerSlug, text, deviceId });
      setValue("");
    } catch {
      toast.error("Não conseguimos concluir esta ação. Tenta novamente.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <Label htmlFor="question" className="text-lg">
        Pergunta para {speakerName}
      </Label>
      <Textarea
        id="question"
        value={value}
        maxLength={QUESTION_MAX}
        placeholder="Escreve aqui a tua pergunta"
        onChange={(event) => setValue(event.target.value)}
        className="min-h-28"
      />
      <p className="text-right text-xs tabular-nums text-muted-foreground">
        {length}/{QUESTION_MAX}
      </p>
      <Button type="submit" className="min-h-11" disabled={pending || !deviceId}>
        Enviar
      </Button>
    </form>
  );
}
