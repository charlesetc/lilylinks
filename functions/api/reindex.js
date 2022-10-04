function normalizeLink(href, site) {
  let link =
    href.startsWith("https://") || href.startsWith("http://")
      ? new URL(href)
      : new URL(href, site);
  return link;
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

async function listKeys(kv) {
  let kvResults = await kv.list();
  return kvResults.keys.map(({ name }) => name);
}

// TODO: make it use POST
export async function onRequestGet(context) {
  let index = {};
  let toIndex = (await listKeys(context.env.Sites)).map((site) => ({
    site,
    depth: 0,
  }));

  function queueForIndex(site, depth) {
    if (!(site in index)) {
      index[site] = true;
      toIndex.push({ site, depth });
    }
  }

  let current;
  while ((current = toIndex.pop())) {
    let { site, depth } = current;
    console.log("hi there", depth);
    if (depth < 10) {
      let links = await getLinks(site);
      index[site] = links;
      for (const link of links) {
        // only crawl domains we have been given
        if (new URL(site).host === new URL(link).host) {
          queueForIndex(link, depth + 1);
        }
      }
    }
  }

  return new Response(JSON.stringify(index), {
    headers: { "Content-Type": "application/json" },
  });
}
