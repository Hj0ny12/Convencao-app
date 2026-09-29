import { Suspense } from "react";
import { ConvexClientProvider } from "@/components/convex-provider";
import { Toaster } from "@/components/ui/sonner";

export default function QuestionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ConvexClientProvider>
      <Toaster />
      <Suspense fallback={<p className="pt-4">A carregar…</p>}>
        {children}
      </Suspense>
    </ConvexClientProvider>
  );
}
