import { listKeys } from "../utils";

export async function onRequest(context) {
  let sites = await listKeys(context.env.Sites);
  return new Response(JSON.stringify(sites), {
    headers: { "Content-Type": "application/json" },
  });
}
