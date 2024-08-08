const BASE_URL = 'https://boardgamegeek.com/xmlapi2/';

export function buildUrl<const Path extends string>(
  path: DisallowLeadingSlash<Path>,
  queries: Record<string, string | null | undefined> = {},
): URL {
  if (path.startsWith('/'))
    throw new Error(`no leading slash allowed: ${path}`);

  const url = new URL(path, BASE_URL);
  for (const [name, value] of Object.entries(queries)) {
    if (value == null) continue;
    url.searchParams.append(name, value);
  }

  return url;
}

type DisallowLeadingSlash<T extends string> = T extends `/${infer _}`
  ? never
  : T;
