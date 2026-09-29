"use client";

import { useState } from "react";
import { login } from "@/app/admin/login/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminLoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setPending(true);
    const result = await login(formData);
    if (result?.error) {
      setError(result.error);
      setPending(false);
    }
  }

  return (
    <main className="dark mx-auto flex min-h-full w-full max-w-[480px] flex-col gap-6 bg-background px-4 py-10 text-foreground">
      <h1 className="text-2xl font-semibold">Admin</h1>
      <form action={onSubmit} className="flex flex-col gap-3">
        <Label htmlFor="passphrase">Passphrase</Label>
        <Input
          id="passphrase"
          name="passphrase"
          type="password"
          autoComplete="current-password"
          className="min-h-11"
        />
        {error ? <p>{error}</p> : null}
        <Button type="submit" className="min-h-11" disabled={pending}>
          Entrar
        </Button>
      </form>
    </main>
  );
}
