// GET /api/news: the Facebook Page's posts that count as news, newest first.
import type { Config } from "@netlify/functions";
import { errorResponse, jsonResponse } from "../lib/http";
import { publicNews } from "../lib/images";
import { sources } from "../lib/sources";

export default async () => {
  try {
    return jsonResponse(publicNews(await sources.news()));
  } catch (err) {
    console.error((err as Error).message);
    return errorResponse(502, "Could not load news");
  }
};

export const config: Config = { path: "/api/news" };
