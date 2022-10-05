export async function onRequestPost(context) {
  let params = Object.fromEntries((await context.request.formData()).entries());
  let site = params["site"];
  if (!(site.startsWith("http://") || site.startsWith("https://"))) {
    site = "http://" + site;
  }
  let url;
  try {
    url = new URL(site);
  } catch {
    return Response.redirect(
      new URL("/flash/add/parse-fail", context.request.url)
    );
  }

  function loadFail() {
    return Response.redirect(
      new URL("/flash/add/load-fail", context.request.url)
    );
  }

  try {
    let fetched = await fetch(site);
    if (!fetched.ok) {
      return loadFail();
    }
  } catch {
    return loadFail();
  }
  await context.env.Sites.put(site, "true");
  return Response.redirect(new URL("/flash/add/success", context.request.url));
}
