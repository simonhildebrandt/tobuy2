import { Repo, IndexedDBStorageAdapter } from "@automerge/react";
import { WebSocketClientAdapter } from "@automerge/automerge-repo-network-websocket";

console.log("Connecting to API_HOST:", API_HOST);
const websocketConnection = new WebSocketClientAdapter(API_HOST);

export const repo = new Repo({
  network: [websocketConnection],
  storage: new IndexedDBStorageAdapter(),
});
window.repo = repo;
