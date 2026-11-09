// The three lists the site reads from Facebook, kept in memory by each function instance.

import { cached } from "./cache";
import { fetchUpcomingEvents } from "./events";
import { loadConfig } from "./facebook";
import { fetchGallery } from "./gallery";
import type { ImageSources } from "./images";
import { fetchNews } from "./posts";

function makeSources(seconds: number): ImageSources {
  return {
    events: cached(() => fetchUpcomingEvents(loadConfig()), seconds),
    news: cached(() => fetchNews(loadConfig()), seconds),
    gallery: cached(() => fetchGallery(loadConfig()), seconds),
  };
}

/** For /api/events, /api/news and /api/gallery, whose answers the CDN keeps an hour anyway. */
export const sources = makeSources(3600);

/**
 * For /api/image: a picture can be asked for as soon as a fresh list names it, so this function's own copy of the
 * lists must not lag far behind, or a new post's picture is missing. It only runs when the CDN does not have the
 * picture yet (pictures are kept a day), so asking Facebook again after 5 minutes costs little.
 */
export const imageSources = makeSources(300);
