"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Plus } from "lucide-react";
import { useUser } from "@/hooks/useUser";
import AdminBotPanel from "@/components/admin/AdminBotPanel";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { user, loading } = useUser();

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    if (!mounted) return;
    setTheme(resolvedTheme === "light" ? "dark" : "light");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* NAVBAR */}
      <nav className="border-b border-border h-14 flex items-center px-6 justify-between">
        <Link href="/" className="font-semibold text-lg">
          Markets
        </Link>

        {/* RIGHT SIDE BUTTONS */}
        <div className="flex items-center gap-2">

          {/* Show Create button ONLY when logged in */}
          {!loading && user && (
            <>
              {user.isAdmin && <AdminBotPanel />}

              <div className="mr-2 px-3 py-1.5 bg-muted/50 rounded-md border border-border text-sm font-medium">
                ${user.balance.toFixed(2)}
              </div>
              <Link href="/portfolio">
                <Button variant="ghost" size="sm">
                  Portfolio
                </Button>
              </Link>
              <Link href="/create">
                <Button variant="default" size="sm" className="flex items-center gap-1">
                  <Plus size={16} />
                  Create
                </Button>
              </Link>
            </>
          )}

          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {mounted && (
              resolvedTheme === "light" ? <Moon size={18} /> : <Sun size={18} />
            )}
          </Button>
        </div>
      </nav>

      {/* PAGE */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}