"use client";

import { ThemeProvider } from "@/providers/ThemeProvider";
import QueryProvider from "@/providers/QueryProvider";
import AppShell from "@/components/layout/AppShell";
import { Toaster } from "sonner";
import WsProvider from "@/components/providers/WsProvider";

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <QueryProvider>
        <WsProvider>
          <AppShell>{children}</AppShell>
          <Toaster richColors />
        </WsProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}