import { listKeys } from "../utils";

export async function onRequest(context) {
  let queue = await listKeys(context.env.Queue);
  return new Response(JSON.stringify(queue), {
    headers: { "Content-Type": "application/json" },
  });
}
