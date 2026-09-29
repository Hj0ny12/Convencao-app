import { speakers } from "@/lib/speakers";

export default function AgendaPage() {
  const ordered = [...speakers].sort((a, b) => a.order - b.order);

  return (
    <div className="flex flex-col gap-6 pt-4">
      <h1 className="text-2xl font-semibold">Agenda</h1>
      <ol className="flex flex-col">
        {ordered.map((speaker) => (
          <li key={speaker.slug} className="border-b border-border py-4">
            <p className="text-sm tabular-nums text-muted-foreground">
              {speaker.time}
            </p>
            <p className="text-lg font-semibold">{speaker.name}</p>
            <p className="text-sm">{speaker.role}</p>
            <p className="mt-1">{speaker.title}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
