"use client";

import { useEffect } from "react";
import "@/lib/ws"; // importing initializes and keeps socket alive

export default function WsProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    console.log("🔌 WsProvider mounted — websocket now stays alive globally");
  }, []);

  return <>{children}</>;
}