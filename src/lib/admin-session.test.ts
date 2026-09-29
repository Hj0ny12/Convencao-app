import { describe, expect, it } from "vitest";
import { SESSION_TTL_SECONDS, signSession, verifySession } from "./admin-session";

const secret = "test-session-secret";

describe("admin session token", () => {
  it("verifies a freshly signed token", async () => {
    const token = await signSession(secret);
    expect(await verifySession(token, secret)).toBe(true);
  });

  it("rejects a flipped signature", async () => {
    const token = await signSession(secret);
    const [payload, signature] = token.split(".");
    const last = signature.at(-1) === "a" ? "b" : "a";
    const tampered = `${payload}.${signature.slice(0, -1)}${last}`;
    expect(await verifySession(tampered, secret)).toBe(false);
  });

  it("rejects an expired exp", async () => {
    const issuedAt = Date.now() - (SESSION_TTL_SECONDS + 5) * 1000;
    const token = await signSession(secret, issuedAt);
    expect(await verifySession(token, secret)).toBe(false);
  });
});
