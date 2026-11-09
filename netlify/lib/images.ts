// Facebook's pictures passed through our own server, so a visitor's browser never contacts Meta's servers.
// Only pictures of the events, posts and album photos the server knows are served: the browser names one of those,
// never a web address, so the server cannot be made to fetch anything else.
//
//   /api/image/event/<event id>              the event's cover
//   /api/image/post/<post id>/<n>            photo n (from 1) of a news post
//   /api/image/post/<post id>/video          the still image of a video post
//   /api/image/photo/<photo id>/small|large  a photo of the gallery album

import type { FacebookEvent, GalleryPhoto, NewsPost } from "./types";

const MAX_BYTES = 15 * 1024 * 1024;

export const eventImagePath = (id: string) => `/api/image/event/${encodeURIComponent(id)}`;
export const postImagePath = (id: string, which: number | "video") => `/api/image/post/${encodeURIComponent(id)}/${which}`;
export const photoImagePath = (id: string, size: "small" | "large") => `/api/image/photo/${encodeURIComponent(id)}/${size}`;

/** What /api/events sends: the events with our address instead of Facebook's for the cover. */
export function publicEvents(events: FacebookEvent[]): FacebookEvent[] {
  return events.map((event) => (event.cover?.source ? { ...event, cover: { ...event.cover, source: eventImagePath(event.id) } } : event));
}

/** What /api/news sends: the news with our addresses for the photos and video stills. */
export function publicNews(news: NewsPost[]): NewsPost[] {
  return news.map((item) => ({
    ...item,
    photos: item.photos.map((photo, i) => ({ ...photo, src: postImagePath(item.id, i + 1) })),
    videoStill: item.videoStill ? { ...item.videoStill, src: postImagePath(item.id, "video") } : null,
  }));
}

/** What /api/gallery sends: the album photos with our addresses. */
export function publicGallery(photos: GalleryPhoto[]): GalleryPhoto[] {
  return photos.map((photo) => ({
    ...photo,
    small: { ...photo.small, src: photoImagePath(photo.id, "small") },
    large: { ...photo.large, src: photoImagePath(photo.id, "large") },
  }));
}

export interface ImageSources {
  events(): Promise<FacebookEvent[]>;
  news(): Promise<NewsPost[]>;
  gallery(): Promise<GalleryPhoto[]>;
}

/** The Facebook address behind one of our paths, or null. */
export async function findImageSource(path: string, sources: ImageSources): Promise<string | null> {
  const event = path.match(/^\/api\/image\/event\/(\d+)$/);
  if (event) {
    const found = (await sources.events()).find((e) => e.id === event[1]);
    return found?.cover?.source ?? null;
  }
  const post = path.match(/^\/api\/image\/post\/(\d+_\d+)\/([1-9]\d*|video)$/);
  if (post) {
    const found = (await sources.news()).find((n) => n.id === post[1]);
    if (!found) return null;
    if (post[2] === "video") return found.videoStill?.src ?? null;
    return found.photos[Number(post[2]) - 1]?.src ?? null;
  }
  const photo = path.match(/^\/api\/image\/photo\/(\d+)\/(small|large)$/);
  if (photo) {
    const found = (await sources.gallery()).find((p) => p.id === photo[1]);
    return found ? found[photo[2] as "small" | "large"].src : null;
  }
  return null;
}

/** Downloads a picture from Facebook. Only images, at most 15 MB. */
export async function fetchPicture(source: string, fetchImage: typeof fetch = fetch): Promise<{ type: string; bytes: Uint8Array<ArrayBuffer> }> {
  const response = await fetchImage(source, { signal: AbortSignal.timeout(15_000) });
  const type = response.headers.get("content-type") ?? "";
  if (!response.ok || !type.startsWith("image/")) throw new Error(`HTTP ${response.status} ${type}`);
  const bytes = new Uint8Array(await response.arrayBuffer());
  if (bytes.length > MAX_BYTES) throw new Error(`too large (${bytes.length} bytes)`);
  return { type, bytes };
}
