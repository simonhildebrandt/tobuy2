import { Repo, IndexedDBStorageAdapter } from "@automerge/react";
import { WebSocketClientAdapter } from "@automerge/automerge-repo-network-websocket";
const websocketConnection = new WebSocketClientAdapter("ws://localhost:8080");

export const repo = new Repo({
  network: [websocketConnection],
  storage: new IndexedDBStorageAdapter(),
});
window.repo = repo;
