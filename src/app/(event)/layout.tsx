import { EventShell } from "@/components/layout/event-shell";

export default function EventLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <EventShell>{children}</EventShell>;
}
