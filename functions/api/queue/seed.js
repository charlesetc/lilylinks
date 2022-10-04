import { listKeys } from "../utils";

export async function onRequest(context) {
  let Queue = context.env.Queue;
  let sites = await listKeys(context.env.Sites);
  for (const site of sites) {
    Queue.put(site, JSON.stringify({ depth: 0 }));
  }
  return new Response(JSON.stringify({ success: true }), {
    headers: { "Content-Type": "application/json" },
  });
}
