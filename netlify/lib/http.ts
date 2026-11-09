// Responses for the functions. `Netlify-CDN-Cache-Control` tells Netlify's CDN how long to keep an answer, so the
// functions (and Facebook) run rarely; `durable` shares that copy between the CDN's locations. Errors are never kept.

const HOUR = 3600;
const DAY = 24 * HOUR;

/** A list from Facebook: the CDN keeps it an hour, browsers five minutes. */
export function jsonResponse(data: unknown): Response {
  return new Response(JSON.stringify(data), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=300",
      "Netlify-CDN-Cache-Control": `public, durable, max-age=${HOUR}, stale-while-revalidate=${DAY}`,
    },
  });
}

/** A picture: kept a day by the CDN and by browsers. */
export function pictureResponse(type: string, bytes: Uint8Array<ArrayBuffer>): Response {
  return new Response(bytes, {
    headers: {
      "Content-Type": type,
      "Content-Length": String(bytes.length),
      "Cache-Control": `public, max-age=${DAY}`,
      "Netlify-CDN-Cache-Control": `public, durable, max-age=${DAY}, stale-while-revalidate=${7 * DAY}`,
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export function errorResponse(status: number, message: string): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "Netlify-CDN-Cache-Control": "no-store",
    },
  });
}
