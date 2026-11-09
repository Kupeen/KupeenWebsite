import { expect, test } from "vitest";
import { fetchPicture, findImageSource, publicEvents, publicGallery, publicNews, type ImageSources } from "./images";
import type { FacebookEvent, GalleryPhoto, NewsPost } from "./types";

const FB = (name: string) => `https://scontent.test.fbcdn.net/${name}.jpg?oe=123`;
const EVENTS: FacebookEvent[] = [
  { id: "1924238635409115", name: "Koncert", start_time: "2026-11-06T20:00:00+0100", cover: { source: FB("cover"), offset_x: 50, offset_y: 58, id: "9" } },
  { id: "2920802601631783", name: "Uden billede", start_time: "2026-11-10T20:00:00+0100" },
];
const NEWS: NewsPost[] = [
  { id: "1184_1196", createdTime: "2026-11-06T06:31:39+0000", text: "Tak", link: "https://www.facebook.com/x", photos: [{ src: FB("p1"), width: 720, height: 960 }, { src: FB("p2"), width: 720, height: 480 }], videoStill: null },
  { id: "1184_1759", createdTime: "2026-10-09T18:32:46+0000", text: "Video", link: "https://www.facebook.com/reel/1", photos: [], videoStill: { src: FB("still"), width: 406, height: 720 } },
];
const GALLERY: GalleryPhoto[] = [
  { id: "555", createdTime: "2026-10-29T10:00:00+0000", caption: "", small: { src: FB("g-small"), width: 640, height: 480 }, large: { src: FB("g-large"), width: 1600, height: 1200 } },
];
const sources: ImageSources = { events: async () => EVENTS, news: async () => NEWS, gallery: async () => GALLERY };

test("the browser gets our addresses, never Facebook's", () => {
  const events = publicEvents(EVENTS);
  expect(events[0].cover).toEqual({ source: "/api/image/event/1924238635409115", offset_x: 50, offset_y: 58, id: "9" });
  expect(events[1].cover).toBeUndefined();
  const news = publicNews(NEWS);
  expect(news[0].photos.map((p) => p.src)).toEqual(["/api/image/post/1184_1196/1", "/api/image/post/1184_1196/2"]);
  expect(news[0].photos[1].height).toBe(480);
  expect(news[1].videoStill?.src).toBe("/api/image/post/1184_1759/video");
  const gallery = publicGallery(GALLERY);
  expect([gallery[0].small.src, gallery[0].large.src]).toEqual(["/api/image/photo/555/small", "/api/image/photo/555/large"]);
  expect(JSON.stringify([events, news, gallery])).not.toContain("fbcdn");
  expect(EVENTS[0].cover?.source).toBe(FB("cover"));
});

test("only pictures of known events, posts and album photos are found", async () => {
  expect(await findImageSource("/api/image/event/1924238635409115", sources)).toBe(FB("cover"));
  expect(await findImageSource("/api/image/post/1184_1196/2", sources)).toBe(FB("p2"));
  expect(await findImageSource("/api/image/post/1184_1759/video", sources)).toBe(FB("still"));
  expect(await findImageSource("/api/image/photo/555/large", sources)).toBe(FB("g-large"));
  for (const path of [
    "/api/image/event/2920802601631783", // an event without a cover
    "/api/image/event/1",
    "/api/image/post/1184_1196/3",
    "/api/image/post/1184_1196/0",
    "/api/image/post/1184_1196/video",
    "/api/image/photo/555/huge",
    "/api/image/photo/556/small",
    "/api/image/event/https%3A%2F%2Fexample.com%2Fx.jpg",
    "/api/image/../../etc/passwd",
    "/api/image/post/1184_1196/1/extra",
  ]) {
    expect(await findImageSource(path, sources), path).toBeNull();
  }
});

test("a picture is fetched as is, and anything that is not a picture is refused", async () => {
  const answer = (type: string) => async () => new Response(new Uint8Array([1, 2, 3]), { headers: { "content-type": type } });
  const picture = await fetchPicture(FB("p1"), answer("image/jpeg"));
  expect(picture.type).toBe("image/jpeg");
  expect([...picture.bytes]).toEqual([1, 2, 3]);
  await expect(fetchPicture(FB("p1"), answer("text/html"))).rejects.toThrow("text/html");
});
