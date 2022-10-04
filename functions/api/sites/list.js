async function listKeys(kv) {
  let kvResults = await kv.list();
  return kvResults.keys.map(({ name }) => name);
}
export async function onRequest(context) {
  let sites = await listKeys(context.env.Sites);
  return new Response(JSON.stringify(sites), {
    headers: { "Content-Type": "text/json" },
  });
}
