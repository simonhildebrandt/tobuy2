export { RepoDurableObject } from "./RepoDurableObject.js";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/admin/import") {
      const auth = request.headers.get("Authorization");
      if (auth !== `Bearer ${env.MIGRATION_SECRET}`) {
        return new Response("unauthorized", { status: 401 });
      }
    }

    // Single shared Repo for the whole app today, mirroring server.mjs's one
    // process / one ./data directory. Switch to
    // env.REPO_DO.idFromName(docIdFromUrl) later to shard per document.
    const id = env.REPO_DO.idFromName("singleton");
    const stub = env.REPO_DO.get(id);
    return stub.fetch(request);
  },
};
