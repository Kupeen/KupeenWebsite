// GET /api/image/…: a picture from Facebook passed through our server (see ../lib/images.ts for the addresses).
import type { Config } from "@netlify/functions";
import { errorResponse, pictureResponse } from "../lib/http";
import { fetchPicture, findImageSource } from "../lib/images";
import { sources } from "../lib/sources";

export default async (req: Request) => {
  const path = new URL(req.url).pathname;
  let source: string | null;
  try {
    source = await findImageSource(path, sources);
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

export const config: Config = { path: "/api/image/*" };
