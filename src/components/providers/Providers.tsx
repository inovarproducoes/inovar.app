"use client";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { AuthGate } from '@/components/auth/AuthGate';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <NextThemesProvider attribute="class" defaultTheme="dark" storageKey="vite-ui-theme" enableSystem>
      <QueryClientProvider client={queryClient}>
        <AuthGate>
          {children}
        </AuthGate>
      </QueryClientProvider>
    </NextThemesProvider>
  );
}
