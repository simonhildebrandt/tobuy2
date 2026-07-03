const SEPARATOR = "/"; // never appears inside a documentId or the fixed segment names automerge-repo uses

/**
 * A StorageAdapter backed by a Durable Object's transactional storage,
 * replacing NodeFSStorageAdapter's filesystem directories with prefix-keyed
 * rows. Mirrors NodeFSStorageAdapter's semantics: StorageKey arrays are
 * joined into a single string key, and loadRange/removeRange match on a
 * "/"-bounded prefix so `["ab"]` never matches a key stored under `["abc"]`.
 */
export class DurableObjectStorageAdapter {
  constructor(storage) {
    this.storage = storage; // DurableObjectState#storage
  }

  async load(key) {
    const value = await this.storage.get(toStorageKey(key));
    return value ? new Uint8Array(value) : undefined;
  }

  async save(key, data) {
    // Durable Object storage values are capped at 2MiB; automerge chunks are
    // always well under that for this app's data volume.
    await this.storage.put(toStorageKey(key), data);
  }

  async remove(key) {
    await this.storage.delete(toStorageKey(key));
  }

  async loadRange(keyPrefix) {
    const entries = await this.storage.list({ prefix: toPrefix(keyPrefix) });
    return Array.from(entries, ([storageKey, data]) => ({
      key: storageKey.split(SEPARATOR),
      data: new Uint8Array(data),
    }));
  }

  async removeRange(keyPrefix) {
    const entries = await this.storage.list({ prefix: toPrefix(keyPrefix) });
    const keys = Array.from(entries.keys());
    if (keys.length) await this.storage.delete(keys);
  }
}

const toStorageKey = (key) => key.join(SEPARATOR);
const toPrefix = (keyPrefix) => toStorageKey(keyPrefix) + SEPARATOR;
