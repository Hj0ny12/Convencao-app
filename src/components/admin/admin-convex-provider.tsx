"use client";

import { createContext, useContext } from "react";
import { ConvexClientProvider } from "@/components/convex-provider";

const AdminSessionContext = createContext<string | null>(null);

export function useAdminSessionToken() {
  return useContext(AdminSessionContext);
}

export function AdminConvexProvider({
  sessionToken,
  children,
}: {
  sessionToken: string;
  children: React.ReactNode;
}) {
  return (
    <AdminSessionContext.Provider value={sessionToken}>
      <ConvexClientProvider>{children}</ConvexClientProvider>
    </AdminSessionContext.Provider>
  );
}
