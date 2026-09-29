export const ADMIN_COOKIE = "fi_admin_session";
export const SESSION_TTL_SECONDS = 18 * 60 * 60;

function bytesToBase64Url(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function base64UrlToBytes(value: string) {
  const padded =
    value.replaceAll("-", "+").replaceAll("_", "/") +
    "=".repeat((4 - (value.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

function timingSafeEqual(a: string, b: string) {
  const aBytes = new TextEncoder().encode(a);
  const bBytes = new TextEncoder().encode(b);
  if (aBytes.length !== bBytes.length) return false;
  let diff = 0;
  for (let index = 0; index < aBytes.length; index += 1) {
    diff |= aBytes[index] ^ bBytes[index];
  }
  return diff === 0;
}

async function sha256(value: string) {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value),
  );
  return bytesToBase64Url(new Uint8Array(digest));
}

async function hmac(payload: string, secret: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payload),
  );
  return bytesToBase64Url(new Uint8Array(signature));
}

export async function passphraseMatches(input: string, expected: string) {
  const [left, right] = await Promise.all([sha256(input), sha256(expected)]);
  return timingSafeEqual(left, right);
}

export async function signSession(secret: string, now = Date.now()) {
  const payload = bytesToBase64Url(
    new TextEncoder().encode(
      JSON.stringify({
        exp: Math.floor(now / 1000) + SESSION_TTL_SECONDS,
      }),
    ),
  );
  return `${payload}.${await hmac(payload, secret)}`;
}

export async function verifySession(
  token: string,
  secret: string,
  now = Date.now(),
) {
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [payload, signature] = parts;
  if (!payload || !signature) return false;
  const expected = await hmac(payload, secret);
  if (!timingSafeEqual(signature, expected)) return false;
  try {
    const parsed = JSON.parse(
      new TextDecoder().decode(base64UrlToBytes(payload)),
    ) as { exp?: unknown };
    return typeof parsed.exp === "number" && parsed.exp * 1000 > now;
  } catch {
    return false;
  }
}
