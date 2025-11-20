// frontend/lib/ws.ts
"use client";

/* ---------------------------
   MARKET UPDATES
---------------------------- */
export type MarketUpdate = {
  type: "market_update";
  marketId: number;
  yes: number;
  no: number;
  yesShares: number;
  noShares: number;
  historyPoint: {
    yes: number;
    no: number;
  };
};

/* ---------------------------
   CANDLE UPDATES
---------------------------- */
export type CandleUpdate = {
  type: "candle_update";
  marketId: number;
  timeframe: string;
  open: number;
  high: number;
  low: number;
  close: number;
  timestamp: string | number;
};

type ServerEvent = MarketUpdate | CandleUpdate | Record<string, any>;

let socket: WebSocket | null = null;
let reconnectTimeout = 500;

/* Listener buckets */
const marketListeners = new Set<(msg: MarketUpdate) => void>();
const candleListeners = new Set<(msg: CandleUpdate) => void>();

/* ---------------------------------------------------
   CONNECT + AUTO RECONNECT
--------------------------------------------------- */
function connect() {
  if (socket && socket.readyState === WebSocket.OPEN) return;

  socket = new WebSocket("ws://localhost:8081");

  socket.onopen = () => {
    reconnectTimeout = 500;
  };

  socket.onmessage = (event) => {
    let parsed: ServerEvent;

    try {
      parsed = JSON.parse(event.data);
    } catch (e) {
      console.error("WS parse error:", e);
      return;
    }

    // MARKET UPDATE
    if (parsed.type === "market_update") {
      const msg = parsed as MarketUpdate;
      for (const cb of marketListeners) cb(msg);
      return;
    }

    // CANDLE UPDATE
    if (parsed.type === "candle_update") {
      const msg = parsed as CandleUpdate;
      for (const cb of candleListeners) cb(msg);
      return;
    }
  };

  socket.onerror = () => {
    try {
      socket?.close();
    } catch {}
  };

  socket.onclose = () => {
    setTimeout(connect, reconnectTimeout);
    reconnectTimeout = Math.min(5000, reconnectTimeout * 1.8);
  };
}

/* ---------------------------------------------------
   EXPLICIT INITIALIZER (called from ClientProviders)
--------------------------------------------------- */
let initialized = false;

export function initWebSocket() {
  if (initialized) return;
  initialized = true;

  if (typeof window !== "undefined") {
    connect();
  }
}

/* ---------------------------------------------------
   SUBSCRIPTION HELPERS
--------------------------------------------------- */
export function subscribeToMarketUpdates(cb: (msg: MarketUpdate) => void) {
  marketListeners.add(cb);
  return () => {
    marketListeners.delete(cb)
};
}

export function subscribeToCandleUpdates(cb: (msg: CandleUpdate) => void) {
  candleListeners.add(cb);
  return () => {
    candleListeners.delete(cb)
  };
}

/* ---------------------------------------------------
   SEND
--------------------------------------------------- */
export function sendWS(data: any) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(data));
  }
}