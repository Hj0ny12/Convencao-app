"use server";

import { redirect } from "next/navigation";
import { passphraseMatches } from "@/lib/admin-session";
import { setAdminCookie } from "@/lib/admin-auth";

export async function login(formData: FormData) {
  const passphrase = String(formData.get("passphrase") ?? "");
  const expected = process.env.ADMIN_PASSPHRASE;
  const secret = process.env.SESSION_SECRET;
  if (
    !expected ||
    !secret ||
    !(await passphraseMatches(passphrase, expected))
  ) {
    return { error: "Passphrase incorreta." as const };
  }
  await setAdminCookie();
  redirect("/admin");
}
