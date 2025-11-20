"use client";

import { useEffect, useState } from "react";

export function useClientAuth() {
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const stored = localStorage.getItem("token");
    setToken(stored);
    setReady(true);
  }, []);

  return { token, ready };
}