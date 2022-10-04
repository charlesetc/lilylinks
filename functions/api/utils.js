export async function listKeys(kv, options) {
  let kvResults = await kv.list(options);
  return kvResults.keys.map(({ name }) => name);
}
