import { listKeys } from "../utils";

export async function onRequest(context) {
  let Index = context.env.Index;
  let indexKeys = await listKeys(Index);

  let entries = await Promise.all(
    indexKeys.map(async (key) => {
      let value = await Index.get(key);
      return [key, JSON.parse(value)];
    })
  );
  let index = Object.fromEntries(entries);

  return new Response(JSON.stringify(index), {
    headers: { "Content-Type": "application/json" },
  });
}
