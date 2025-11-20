// backend/src/ws/server.ts
import WebSocket, { WebSocketServer } from "ws";

let wss: WebSocketServer | null = null;

interface ClientMeta {
  ws: WebSocket;
  marketId?: number;
}

const clients = new Set<ClientMeta>();

export function startWebSocketServer() {
  if (wss) return; // prevent double init

  wss = new WebSocketServer({ port: 8081 });

  console.log("🔌 WebSocket running on ws://localhost:8081");

  wss.on("connection", (ws) => {
    const client: ClientMeta = { ws };
    clients.add(client);

    ws.on("message", (msg) => {
      try {
        const data = JSON.parse(msg.toString());
        if (data.type === "subscribe") {
          client.marketId = data.marketId;
        }
      } catch {}
    });

    ws.on("close", () => {
      clients.delete(client);
    });
  });
}

export function broadcast(data: any) {
  const payload = JSON.stringify(data);

  for (const client of clients) {
    if (client.ws.readyState !== WebSocket.OPEN) continue;
    if (data.marketId && client.marketId !== data.marketId) continue;
    client.ws.send(payload);
  }
}