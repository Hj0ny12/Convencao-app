"use client";

import { useEffect, useState } from "react";
import { employees, type Employee } from "@/lib/employees";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "fi-convention-after-result";

export default function SlotMachine() {
  const [current, setCurrent] = useState<Employee>(employees[0]);
  const [winner, setWinner] = useState<Employee | null>(null);
  const [spinning, setSpinning] = useState(false);

  useEffect(() => {
    for (const employee of employees) {
      const image = new Image();
      image.src = employee.image;
    }
    const stored = sessionStorage.getItem(STORAGE_KEY);
    const found = employees.find((employee) => employee.id === stored);
    if (found) {
      setCurrent(found);
      setWinner(found);
    }
  }, []);

  function discover() {
    if (winner || spinning) return;
    const chosen = employees[Math.floor(Math.random() * employees.length)];
    sessionStorage.setItem(STORAGE_KEY, chosen.id);
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduced) {
      setCurrent(chosen);
      setWinner(chosen);
      return;
    }
    setSpinning(true);
    const steps = 16;
    let step = 0;
    const tick = () => {
      const showing =
        step >= steps - 1
          ? chosen
          : employees[(employees.indexOf(chosen) + step) % employees.length];
      setCurrent(showing);
      step += 1;
      if (step < steps) {
        window.setTimeout(tick, 40 + step * 22);
        return;
      }
      setWinner(chosen);
      setSpinning(false);
    };
    tick();
  }

  return (
    <div className="flex flex-col items-center gap-6 pt-6 text-center">
      <h1 className="text-3xl font-semibold">Onde é o After?</h1>
      <div className="size-48 overflow-hidden bg-muted">
        <img
          src={current.image}
          alt=""
          className={`size-full object-cover ${winner && !spinning ? "motion-safe:animate-[fade-in_400ms_ease-out]" : ""}`}
        />
      </div>
      {winner && !spinning ? (
        <div className="flex flex-col gap-2">
          <p>O AFTER É NO QUARTO DO</p>
          <p className="text-2xl font-semibold">{winner.name.toUpperCase()}</p>
        </div>
      ) : (
        <Button
          type="button"
          className="min-h-11"
          disabled={spinning}
          onClick={discover}
        >
          DESCOBRIR
        </Button>
      )}
    </div>
  );
}
