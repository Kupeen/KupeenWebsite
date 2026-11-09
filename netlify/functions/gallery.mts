// GET /api/gallery: the photos of the album set in FB_GALLERY_ALBUM_ID, newest first; an empty list without one.
import type { Config } from "@netlify/functions";
import { errorResponse, jsonResponse } from "../lib/http";
import { publicGallery } from "../lib/images";
import { sources } from "../lib/sources";

export default async () => {
  try {
    return jsonResponse(publicGallery(await sources.gallery()));
  } catch (err) {
    console.error((err as Error).message);
    return errorResponse(502, "Could not load photos");
  }
};

export const config: Config = { path: "/api/gallery" };
