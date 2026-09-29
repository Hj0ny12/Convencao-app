import { useEffect, useState } from "react";

const STORAGE_KEY = "fi-convention-device-id";
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function getDeviceId(): string {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && UUID_RE.test(stored)) return stored;
  const next = crypto.randomUUID();
  localStorage.setItem(STORAGE_KEY, next);
  return next;
}

export function useDeviceId(): string | null {
  const [deviceId, setDeviceId] = useState<string | null>(null);

  useEffect(() => {
    setDeviceId(getDeviceId());
  }, []);

  return deviceId;
}
