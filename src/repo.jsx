import {
  Repo,
  BroadcastChannelNetworkAdapter,
  IndexedDBStorageAdapter,
} from "@automerge/react";

export const repo = new Repo({
  network: [new BroadcastChannelNetworkAdapter()],
  storage: new IndexedDBStorageAdapter(),
});
window.repo = repo;
