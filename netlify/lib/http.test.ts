import { expect, test } from "vitest";
import { errorResponse, jsonResponse, pictureResponse } from "./http";

const cdn = (res: Response) => res.headers.get("Netlify-CDN-Cache-Control");
const browser = (res: Response) => res.headers.get("Cache-Control");

test("lists are kept an hour by the CDN and five minutes by browsers", () => {
  const res = jsonResponse([]);
  expect(cdn(res)).toBe("public, durable, max-age=3600, stale-while-revalidate=86400");
  expect(browser(res)).toBe("public, max-age=300");
});

test("pictures are kept a day by the CDN and by browsers", () => {
  const res = pictureResponse("image/jpeg", new Uint8Array([1, 2, 3]));
  expect(cdn(res)).toBe("public, durable, max-age=86400, stale-while-revalidate=604800");
  expect(browser(res)).toBe("public, max-age=86400");
  expect(res.headers.get("Content-Length")).toBe("3");
});

test("the CDN keeps a missing picture five minutes and a Facebook failure one minute; browsers keep neither", async () => {
  const missing = errorResponse(404, "No such picture");
  expect(missing.status).toBe(404);
  expect(cdn(missing)).toBe("public, durable, max-age=300");
  expect(browser(missing)).toBe("no-store");
  expect(await missing.json()).toEqual({ error: "No such picture" });

  const failed = errorResponse(502, "Could not load news");
  expect(failed.status).toBe(502);
  expect(cdn(failed)).toBe("public, durable, max-age=60");
  expect(browser(failed)).toBe("no-store");
});
