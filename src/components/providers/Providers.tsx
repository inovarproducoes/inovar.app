"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { AuthGate } from "@/components/auth/AuthGate";
import { PageTitleProvider } from "@/context/PageTitleContext";
import { AppShell } from "@/components/layout/AppShell";
import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5,
            gcTime: 1000 * 60 * 15,
            retry: 1,
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
          },
        },
      })
  );

  return (
    <NextThemesProvider attribute="class" defaultTheme="dark" storageKey="inovar-theme" enableSystem>
      <QueryClientProvider client={queryClient}>
        <AuthGate>
          <PageTitleProvider>
            <AppShell>
              {children}
            </AppShell>
          </PageTitleProvider>
        </AuthGate>
        <Toaster richColors position="top-right" />
      </QueryClientProvider>
    </NextThemesProvider>
  );
}
