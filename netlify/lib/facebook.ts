// The Facebook Graph API. Server side only: the Page token must never reach the browser.

const GRAPH = "https://graph.facebook.com/v25.0";

export interface FacebookConfig {
  pageId: string;
  token: string;
  /** The album the photo section shows; null leaves the section out. */
  galleryAlbumId: string | null;
}

// Set in Netlify's environment variables (locally in .env, see README.md).
export function loadConfig(env: Record<string, string | undefined> = process.env): FacebookConfig {
  const pageId = env.FB_PAGE_ID?.trim() ?? "";
  const token = env.FB_PAGE_TOKEN?.trim() ?? "";
  const missing = [["FB_PAGE_ID", pageId], ["FB_PAGE_TOKEN", token]].filter(([, value]) => !value).map(([name]) => name);
  if (missing.length > 0) throw new Error(`Missing ${missing.join(" and ")} in the environment variables.`);
  return { pageId, token, galleryAlbumId: env.FB_GALLERY_ALBUM_ID?.trim() || null };
}

/** The address of a Graph API object or list, e.g. "<page id>/events". */
export function graphUrl(path: string, params: Record<string, string>, token: string): string {
  return `${GRAPH}/${path}?${new URLSearchParams({ ...params, access_token: token })}`;
}

/** The parsed answer. Error messages never contain the token; the answer's paging addresses do, so callers pass on only `data`. */
export async function getJson<T>(url: string, token: string): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, { signal: AbortSignal.timeout(15_000) });
  } catch (err) {
    const reason = (err as { cause?: { code?: string }; name?: string }).cause?.code ?? (err as Error).name;
    throw new Error(`Could not reach the Graph API (${reason}).`);
  }
  const body = (await res.json().catch(() => null)) as { error?: { message: string; code: number; error_subcode?: number; type: string } } | null;
  if (!res.ok || body?.error) {
    const e = body?.error;
    let message = `Graph API error (HTTP ${res.status})`;
    if (e) message += `: ${e.message} [code ${e.code}${e.error_subcode ? `/${e.error_subcode}` : ""}, ${e.type}]`;
    if (e?.code === 190) message += " The token is invalid or expired; create a new one.";
    throw new Error(message.replaceAll(token, "[token]"));
  }
  return body as T;
}

export { parseFacebookDate } from "./dates";
