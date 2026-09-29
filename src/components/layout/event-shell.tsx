import { BottomNav } from "@/components/navigation/bottom-nav";

export function EventShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="dark mx-auto flex min-h-full w-full max-w-[480px] flex-col bg-background text-foreground">
      <header className="px-4 pt-5 pb-2 text-sm font-medium">
        FI Group Convention 2026
      </header>
      <main className="flex-1 px-4 pb-24">{children}</main>
      <BottomNav />
    </div>
  );
}
