// Responses for the functions. `Netlify-CDN-Cache-Control` tells Netlify's CDN how long to keep an answer, so the
// functions (and Facebook) run rarely; `durable` shares that copy between the CDN's locations. Each run of a function
// costs credits on Netlify, so even errors are kept for a short while; browsers never keep them.

const HOUR = 3600;
const DAY = 24 * HOUR;

/**
 * How long the CDN keeps an error. A missing picture: 5 minutes, so an old address that is asked for again and again
 * (a post that has left the news, a crawler) runs the function rarely, while a picture that appears a little later
 * than its post is not missing for long. A failed Facebook call: 1 minute, so while Facebook fails, the functions run
 * about once a minute instead of on every visit.
 */
export const ERROR_CDN_SECONDS = { 404: 300, 502: 60 } as const;

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

/** 404: no such picture; 502: Facebook could not be reached or refused. */
export function errorResponse(status: keyof typeof ERROR_CDN_SECONDS, message: string): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "Netlify-CDN-Cache-Control": `public, durable, max-age=${ERROR_CDN_SECONDS[status]}`,
    },
  });
}
