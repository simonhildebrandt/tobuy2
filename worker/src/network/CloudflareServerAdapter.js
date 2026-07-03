import { NetworkAdapter, cbor } from "@automerge/automerge-repo";

const PROTOCOL_V1 = "1";

/**
 * A NetworkAdapter that speaks the same join/peer/CBOR wire protocol as
 * @automerge/automerge-repo-network-websocket's WebSocketServerAdapter, but
 * driven by a Durable Object's WebSocket Hibernation API instead of a `ws`
 * server. The DO forwards its webSocketMessage/webSocketClose/webSocketError
 * lifecycle callbacks into this adapter; there is no long-lived "server"
 * object here to attach listeners to.
 */
export class CloudflareServerAdapter extends NetworkAdapter {
  sockets = new Map(); // peerId -> WebSocket

  isReady() {
    return true;
  }

  whenReady() {
    return Promise.resolve();
  }

  connect(peerId, peerMetadata) {
    this.peerId = peerId;
    this.peerMetadata = peerMetadata;
  }

  disconnect() {
    for (const socket of this.sockets.values()) socket.close();
    this.sockets.clear();
  }

  send(message) {
    if ("data" in message && message.data?.byteLength === 0) {
      throw new Error("Tried to send a zero-length message");
    }
    const socket = this.sockets.get(message.targetId);
    if (!socket) return; // peer disconnected; drop the message like the node adapter does
    socket.send(cbor.encode(message));
  }

  /** Call from the Durable Object's webSocketMessage(ws, message) */
  receiveMessage(socket, messageBytes) {
    let message;
    try {
      message = cbor.decode(new Uint8Array(messageBytes));
    } catch (e) {
      socket.close();
      return;
    }

    if (message.type === "join") {
      this.#handleJoin(socket, message);
    } else {
      this.emit("message", message);
    }
  }

  /** Call from the Durable Object's webSocketClose/webSocketError(ws) */
  removeSocket(socket) {
    const peerId = this.#peerIdFor(socket);
    if (!peerId) return;
    this.sockets.delete(peerId);
    this.emit("peer-disconnected", { peerId });
  }

  /**
   * After the DO wakes from hibernation its in-memory state (including this
   * adapter's `sockets` map) is gone, but the sockets themselves are still
   * attached. Call this once in the DO constructor, after re-fetching the
   * live sockets via ctx.getWebSockets(), to restore peerId -> socket
   * routing before any messages arrive.
   */
  rehydrate(sockets) {
    for (const socket of sockets) {
      const { peerId } = socket.deserializeAttachment() ?? {};
      if (peerId) this.sockets.set(peerId, socket);
    }
  }

  #handleJoin(socket, message) {
    const { senderId, peerMetadata, supportedProtocolVersions } = message;

    const existing = this.sockets.get(senderId);
    if (existing && existing !== socket) {
      existing.close();
      this.emit("peer-disconnected", { peerId: senderId });
    }

    socket.serializeAttachment({ peerId: senderId });
    this.sockets.set(senderId, socket);
    this.emit("peer-candidate", { peerId: senderId, peerMetadata });

    const supported =
      supportedProtocolVersions === undefined ||
      supportedProtocolVersions.includes(PROTOCOL_V1);

    if (!supported) {
      this.send({
        type: "error",
        senderId: this.peerId,
        message: "unsupported protocol version",
        targetId: senderId,
      });
      socket.close();
      this.sockets.delete(senderId);
      return;
    }

    this.send({
      type: "peer",
      senderId: this.peerId,
      peerMetadata: this.peerMetadata,
      selectedProtocolVersion: PROTOCOL_V1,
      targetId: senderId,
    });
  }

  #peerIdFor(socket) {
    for (const [peerId, s] of this.sockets) {
      if (s === socket) return peerId;
    }
    try {
      return socket.deserializeAttachment()?.peerId ?? null;
    } catch {
      return null;
    }
  }
}
