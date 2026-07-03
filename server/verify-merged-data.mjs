import { Repo } from "@automerge/automerge-repo";
import { NodeFSStorageAdapter } from "@automerge/automerge-repo-storage-nodefs";
import fs from "node:fs";

const dir = process.argv[2];
const docIds = fs
  .readdirSync(dir)
  .filter((shard) => fs.statSync(`${dir}/${shard}`).isDirectory() && shard !== "st")
  .flatMap((shard) =>
    fs.readdirSync(`${dir}/${shard}`).map((rest) => shard + rest)
  );

const repo = new Repo({ network: [], storage: new NodeFSStorageAdapter(dir) });

for (const id of docIds) {
  const handle = await repo.find(id);
  await handle.whenReady();
  const doc = handle.doc();
  const itemCount = Array.isArray(doc.items) ? doc.items.length : "?";
  console.log(`${id}: ok, top-level keys = [${Object.keys(doc)}], items = ${itemCount}`);
}
process.exit(0);
