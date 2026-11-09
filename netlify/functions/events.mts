// GET /api/events: the Facebook Page's upcoming events, soonest first.
import type { Config } from "@netlify/functions";
import { errorResponse, jsonResponse } from "../lib/http";
import { publicEvents } from "../lib/images";
import { sources } from "../lib/sources";

export default async () => {
  try {
    return jsonResponse(publicEvents(await sources.events()));
  } catch (err) {
    console.error((err as Error).message);
    return errorResponse(502, "Could not load events");
  }
};

export const config: Config = { path: "/api/events" };
