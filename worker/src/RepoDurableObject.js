import { DurableObject } from "cloudflare:workers";
import { Repo } from "@automerge/automerge-repo";
import { CloudflareServerAdapter } from "./network/CloudflareServerAdapter.js";
import { DurableObjectStorageAdapter } from "./storage/DurableObjectStorageAdapter.js";

export class RepoDurableObject extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);

    this.networkAdapter = new CloudflareServerAdapter();
    // Restore peerId -> socket routing lost when hibernation evicted this
    // object's in-memory state; the sockets themselves are still attached.
    this.networkAdapter.rehydrate(ctx.getWebSockets());

    this.repo = new Repo({
      network: [this.networkAdapter],
      storage: new DurableObjectStorageAdapter(ctx.storage),
      peerId: "tobuy2-sync-server",
    });
  }

  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname === "/admin/import" && request.method === "PUT") {
      const { key, data } = await request.json();
      await this.ctx.storage.put(key.join("/"), base64ToBytes(data));
      return new Response("ok");
    }

    if (request.headers.get("Upgrade") !== "websocket") {
      return new Response("expected websocket", { status: 426 });
    }

    const { 0: client, 1: server } = new WebSocketPair();
    this.ctx.acceptWebSocket(server);
    return new Response(null, { status: 101, webSocket: client });
  }

  async webSocketMessage(ws, message) {
    this.networkAdapter.receiveMessage(ws, message);
  }

  async webSocketClose(ws) {
    this.networkAdapter.removeSocket(ws);
  }

  async webSocketError(ws) {
    this.networkAdapter.removeSocket(ws);
  }
}

const base64ToBytes = (base64) =>
  Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
