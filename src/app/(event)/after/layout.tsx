import { ConvexClientProvider } from "@/components/convex-provider";

export default function AfterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ConvexClientProvider>{children}</ConvexClientProvider>;
}
