"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { api } from "../../../convex/_generated/api";
import { useDeviceId } from "@/lib/anonymous-device";
import { WORD_MAX } from "@/lib/limits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function WordForm() {
  const deviceId = useDeviceId();
  const mine = useQuery(
    api.words.mine,
    deviceId ? { deviceId } : "skip",
  );
  const submit = useMutation(api.words.submit);
  const [value, setValue] = useState("");
  const [pending, setPending] = useState(false);

  if (mine === undefined || !deviceId) {
    return <p>A carregar…</p>;
  }

  if (mine) {
    return (
      <div className="flex flex-col gap-2">
        <p>Palavra enviada.</p>
        <p className="text-2xl font-semibold">{mine.displayWord}</p>
      </div>
    );
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!deviceId || pending) return;
    setPending(true);
    try {
      await submit({ raw: value, deviceId });
    } catch {
      toast.error("Não conseguimos concluir esta ação. Tenta novamente.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <Label htmlFor="word">
        Se tivesses de definir a FI Group numa palavra, qual seria?
      </Label>
      <Input
        id="word"
        value={value}
        maxLength={WORD_MAX}
        onChange={(event) => setValue(event.target.value)}
        className="min-h-11"
      />
      <Button type="submit" className="min-h-11" disabled={pending}>
        Enviar
      </Button>
    </form>
  );
}
