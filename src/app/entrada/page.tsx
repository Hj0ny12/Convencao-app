import { headers } from "next/headers";
import QRCode from "qrcode";
import { joinUrlFromHost } from "@/lib/join-url";

export const dynamic = "force-dynamic";

export default async function EntradaPage() {
  const headerList = await headers();
  const { url, isLocal } = joinUrlFromHost(
    headerList.get("x-forwarded-host") ?? headerList.get("host"),
    headerList.get("x-forwarded-proto"),
  );
  const svg = (
    await QRCode.toString(url, {
      type: "svg",
      margin: 1,
      errorCorrectionLevel: "M",
      color: { dark: "#111111", light: "#ffffff" },
    })
  ).replace(
    "<svg ",
    '<svg role="img" aria-label="Código QR da convenção" ',
  );

  return (
    <main className="dark flex h-dvh flex-col items-center justify-center gap-5 overflow-hidden bg-background px-6 py-6 text-center text-foreground">
      <div className="space-y-2">
        <p className="text-sm tracking-wide text-muted-foreground uppercase">
          FI Group Convention 2026
        </p>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Entra com o telemóvel
        </h1>
        <p className="text-lg text-muted-foreground sm:text-2xl">
          Abre a câmara e aponta ao código.
        </p>
      </div>
      <div
        className="w-[min(72vw,22rem)] rounded-2xl bg-white p-4 [&>svg]:h-auto [&>svg]:w-full"
        dangerouslySetInnerHTML={{ __html: svg }}
      />
      <p className="font-mono text-lg break-all sm:text-2xl">{url}</p>
      {isLocal ? (
        <p className="max-w-md text-sm text-muted-foreground">
          Este código aponta para este computador. No evento, abre esta página
          no endereço público.
        </p>
      ) : null}
    </main>
  );
}
