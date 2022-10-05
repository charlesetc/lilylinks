import { listKeys } from "../utils";

function normalizeLink(href, site) {
  let link =
    href.startsWith("https://") || href.startsWith("http://")
      ? new URL(href)
      : new URL(href, site);
  return link.toString();
}

async function getLinks(site) {
  const links = [];
  try {
    const response = await fetch(site.toString());
    const rewriter = new HTMLRewriter();
    rewriter.on("a", {
      element(element) {
        let href = element.getAttribute("href").replaceAll("&#x2F;", "/");
        links.push(normalizeLink(href, site));
      },
    });
    const transformed = rewriter.transform(response);
    await transformed.text();
  } catch (e) {
    console.log("error when fetching site", site, e);
  }
  return links;
}

// TODO: make it use POST
export async function onRequestGet(context) {
  let Queue = context.env.Queue;
  let Index = context.env.Index;
  let toIndex = await listKeys(Queue, { limit: 20 });
  for (const site of toIndex) {
    let { depth } = JSON.parse(await Queue.get(site));
    await Queue.delete(site);
    if (depth < 10) {
      let links = await getLinks(site);
      await Index.put(site, JSON.stringify(links));
      for (const link of links) {
        const indexed = await Index.get(link);
        if (indexed === null && new URL(site).host === new URL(link).host) {
          await Queue.put(link, JSON.stringify({ depth: depth + 1 }));
        }
      }
    }
  }

  return new Response(JSON.stringify({ success: true }), {
    headers: { "Content-Type": "application/json" },
  });
}
