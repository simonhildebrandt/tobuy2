// One-off migration: uploads server/data/* into the Durable Object's storage
// via the worker's /admin/import route.
//
// Usage:
//   MIGRATION_SECRET=... WORKER_URL=https://tobuy2-sync.<subdomain>.workers.dev \
//     node scripts/migrate-data.mjs
//
// Run `wrangler secret put MIGRATION_SECRET` first so the deployed worker's
// env.MIGRATION_SECRET matches. Remove the secret (or the /admin/import
// route) once migration is done.

import fs from "node:fs/promises";
import path from "node:path";

const DATA_DIR = process.env.DATA_DIR ?? "../server/data";
const WORKER_URL = process.env.WORKER_URL;
const MIGRATION_SECRET = process.env.MIGRATION_SECRET;

if (!WORKER_URL || !MIGRATION_SECRET) {
  console.error("Set WORKER_URL and MIGRATION_SECRET env vars.");
  process.exit(1);
}

// Reverses NodeFSStorageAdapter's getFilePath():
//   path.join(baseDir, firstKey.slice(0,2), firstKey.slice(2), ...rest)
// So the first two path components concatenate back into the original
// firstKey, and everything after that is the rest of the StorageKey.
const keyFromRelativePath = (relativePath) => {
  const parts = relativePath.split(path.sep);
  const [shard, shardRest, ...rest] = parts;
  return [shard + shardRest, ...rest];
};

const walk = async (dir) => {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const full = path.join(dir, entry.name);
      return entry.isDirectory() ? walk(full) : [full];
    })
  );
  return files.flat();
};

const main = async () => {
  const files = await walk(DATA_DIR);
  console.log(`Found ${files.length} files under ${DATA_DIR}`);

  for (const file of files) {
    const relativePath = path.relative(DATA_DIR, file);
    const key = keyFromRelativePath(relativePath);
    const data = await fs.readFile(file);

    const res = await fetch(`${WORKER_URL}/admin/import`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${MIGRATION_SECRET}`,
      },
      body: JSON.stringify({ key, data: data.toString("base64") }),
    });

    if (!res.ok) {
      throw new Error(`Failed to import ${relativePath}: ${res.status} ${await res.text()}`);
    }
    console.log(`Imported ${relativePath} -> [${key.join(", ")}]`);
  }

  console.log("Done.");
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
