"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { toast } from "sonner";
import { api } from "../../../convex/_generated/api";
import { useAdminSessionToken } from "@/components/admin/admin-convex-provider";
import { Button } from "@/components/ui/button";

const statuses = ["OPEN", "VOTING", "FINISHED"] as const;

export function SessionStatusControl({
  speakerSlug,
  sessionStatus,
}: {
  speakerSlug: string;
  sessionStatus: (typeof statuses)[number];
}) {
  const sessionToken = useAdminSessionToken();
  const setSessionStatus = useMutation(api.admin.setSessionStatus);
  const [pending, setPending] = useState(false);

  async function onSelect(next: (typeof statuses)[number]) {
    if (!sessionToken || pending) return;
    setPending(true);
    try {
      await setSessionStatus({
        sessionToken,
        speakerSlug,
        sessionStatus: next,
      });
    } catch {
      toast.error("Não conseguimos concluir esta ação. Tenta novamente.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {statuses.map((status) => (
        <Button
          key={status}
          type="button"
          variant={sessionStatus === status ? "default" : "outline"}
          aria-pressed={sessionStatus === status}
          className="min-h-11"
          disabled={pending}
          onClick={() => onSelect(status)}
        >
          {status}
        </Button>
      ))}
    </div>
  );
}
