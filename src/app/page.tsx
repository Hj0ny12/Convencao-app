import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col gap-8 pt-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">
          FI Group Convention 2026
        </h1>
        <p className="text-lg">A Convenção também acontece aqui.</p>
      </div>
      <div className="flex flex-col gap-3">
        <Button asChild className="min-h-11">
          <Link href="/questions">Fazer uma pergunta</Link>
        </Button>
        <Button asChild variant="outline" className="min-h-11">
          <Link href="/agenda">Ver agenda</Link>
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">
        Participação anónima. Não pedimos nome, email ou conta.
      </p>
    </div>
  );
}
