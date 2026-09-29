"use client";

import dynamic from "next/dynamic";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { LockedAfter } from "@/components/after/locked-after";

const SlotMachine = dynamic(() => import("@/components/after/slot-machine"), {
  ssr: false,
  loading: () => null,
});

export function AfterScreen() {
  const state = useQuery(api.eventState.get);
  if (state === undefined) return <p className="pt-4">A carregar…</p>;
  if (!state.afterUnlocked) return <LockedAfter />;
  return <SlotMachine />;
}
