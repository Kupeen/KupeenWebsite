import { expect, test } from "vitest";
import { loadConfig } from "./facebook";
import { fetchGallery, galleryFromPhotos, pickImage } from "./gallery";

const sizes = [
  { source: "https://img.test/2048.jpg", width: 1479, height: 2048 },
  { source: "https://img.test/720.jpg", width: 520, height: 720 },
  { source: "https://img.test/960.jpg", width: 693, height: 960 },
  { source: "https://img.test/130.jpg", width: 94, height: 130 },
];

test("the smallest image that is wide enough is chosen, else the largest", () => {
  expect(pickImage(sizes, 640).src).toBe("https://img.test/960.jpg");
  expect(pickImage(sizes, 1600).src).toBe("https://img.test/2048.jpg");
  expect(pickImage(sizes, 50).src).toBe("https://img.test/130.jpg");
});

test("album photos come newest first, with a short caption, and photos without images are left out", () => {
  const gallery = galleryFromPhotos([
    { id: "1", created_time: "2026-09-01T10:00:00+0000", name: "Hjemmelyd 2026\nTak til alle", images: sizes },
    { id: "2", created_time: "2026-10-01T10:00:00+0000", images: sizes },
    { id: "3", created_time: "2026-11-01T10:00:00+0000", images: [] },
  ]);
  expect(gallery.map((p) => p.id)).toEqual(["2", "1"]);
  expect(gallery[1].caption).toBe("Hjemmelyd 2026");
  expect(gallery[0].caption).toBe("");
  expect([gallery[0].small.width, gallery[0].large.width]).toEqual([693, 1479]);
});

test("without an album there is no gallery and Facebook is not asked", async () => {
  const config = loadConfig({ FB_PAGE_ID: "1", FB_PAGE_TOKEN: "t", FB_GALLERY_ALBUM_ID: " " });
  expect(config.galleryAlbumId).toBeNull();
  expect(await fetchGallery(config)).toEqual([]);
});

test("missing settings are named, without showing any value", () => {
  expect(() => loadConfig({})).toThrow("Missing FB_PAGE_ID and FB_PAGE_TOKEN in the environment variables.");
});
