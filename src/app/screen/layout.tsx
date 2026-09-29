import { ConvexClientProvider } from "@/components/convex-provider";

export default function ScreenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ConvexClientProvider>
      <div className="dark min-h-dvh bg-background text-foreground">{children}</div>
    </ConvexClientProvider>
  );
}
