"use client";

import { useEffect } from "react";

export function useLiveMarket(onUpdate: (data: any) => void) {
  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8081");

    ws.onmessage = (msg) => {
      const data = JSON.parse(msg.data);
      if (data.type === "price_update") {
        onUpdate(data);
      }
    };

    return () => ws.close();
  }, []);
}