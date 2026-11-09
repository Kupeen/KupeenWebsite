// GET /api/image/…: a picture from Facebook passed through our server (see ../lib/images.ts for the addresses).
import type { Config } from "@netlify/functions";
import { errorResponse, pictureResponse } from "../lib/http";
import { fetchPicture, findImageSource } from "../lib/images";
import { imageSources } from "../lib/sources";

export default async (req: Request) => {
  const path = new URL(req.url).pathname;
  let source: string | null;
  try {
    source = await findImageSource(path, imageSources);
  } catch (err) {
    console.error(`Image ${path}: ${(err as Error).message}`);
    return errorResponse(502, "Could not load the picture");
  }
  if (!source) return errorResponse(404, "No such picture");

  try {
    const picture = await fetchPicture(source);
    return pictureResponse(picture.type, picture.bytes);
  } catch (err) {
    console.error(`Image ${path}: ${(err as Error).message}`);
    return errorResponse(502, "Could not load the picture");
  }
};

export const config: Config = {
  path: "/api/image/*",
  // Every picture costs bandwidth credits on Netlify. One visitor needs a few dozen at most, even with the photo viewer;
  // this stops a script or a crawler that asks for pictures over and over from one address (it gets 429). People who
  // share one address, as on many mobile networks, stay well below it together. Netlify's Free plan allows two such
  // rules per site; this is the only one so far.
  rateLimit: { windowLimit: 300, windowSize: 60, aggregateBy: ["ip", "domain"] },
};
