import { AdminConvexProvider } from "@/components/admin/admin-convex-provider";
import { requireAdmin } from "@/lib/admin-auth";
import { logout } from "@/app/admin/(panel)/actions";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sessionToken = await requireAdmin();

  return (
    <AdminConvexProvider sessionToken={sessionToken}>
      <Toaster />
      <div className="dark mx-auto flex min-h-full w-full max-w-5xl flex-col gap-6 bg-background px-6 py-6 text-foreground">
        {children}
        <form action={logout}>
          <Button type="submit" variant="outline" className="min-h-11">
            Sair
          </Button>
        </form>
      </div>
    </AdminConvexProvider>
  );
}
