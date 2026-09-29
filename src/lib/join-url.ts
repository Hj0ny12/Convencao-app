export function joinUrlFromHost(host: string | null, proto: string | null) {
  const hostname = (host ?? "localhost:3000").split(",")[0]?.trim() || "localhost:3000";
  const isLocal =
    hostname.startsWith("localhost") ||
    hostname.startsWith("127.0.0.1") ||
    hostname.startsWith("[::1]");
  const protocol =
    proto?.split(",")[0]?.trim() || (isLocal ? "http" : "https");
  return {
    url: `${protocol}://${hostname}/`,
    isLocal,
  };
}
