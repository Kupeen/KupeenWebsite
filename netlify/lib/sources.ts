// The three lists the site reads from Facebook, each fetched at most once an hour per function instance.

import { cached } from "./cache";
import { fetchUpcomingEvents } from "./events";
import { loadConfig } from "./facebook";
import { fetchGallery } from "./gallery";
import type { ImageSources } from "./images";
import { fetchNews } from "./posts";

export const sources: ImageSources = {
  events: cached(() => fetchUpcomingEvents(loadConfig())),
  news: cached(() => fetchNews(loadConfig())),
  gallery: cached(() => fetchGallery(loadConfig())),
};
