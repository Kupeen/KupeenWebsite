// The photo section's pictures: one album on the Facebook Page, chosen with FB_GALLERY_ALBUM_ID.
// Without an album there is no gallery, and the page leaves the section out.

import { getJson, graphUrl, parseFacebookDate, type FacebookConfig } from "./facebook";
import type { GalleryPhoto, Picture } from "./types";

const FIELDS = "id,created_time,name,images";
const PHOTOS_TO_READ = 60;
const SMALL_WIDTH = 640; // the strip shows pictures about 300 px wide; twice that stays sharp
const LARGE_WIDTH = 1600; // the photo viewer

interface AlbumPhoto {
  id: string;
  created_time: string;
  name?: string;
  images?: { source: string; width: number; height: number }[];
}

export async function fetchGallery({ token, galleryAlbumId }: FacebookConfig): Promise<GalleryPhoto[]> {
  if (!galleryAlbumId) return [];
  const url = graphUrl(`${encodeURIComponent(galleryAlbumId)}/photos`, { fields: FIELDS, limit: String(PHOTOS_TO_READ) }, token);
  const body = await getJson<{ data?: AlbumPhoto[] }>(url, token);
  return galleryFromPhotos(body.data ?? []);
}

/** The album's photos, newest first, each in a small and a large size. Photos without images are left out. */
export function galleryFromPhotos(photos: AlbumPhoto[]): GalleryPhoto[] {
  return photos
    .flatMap((photo) => {
      const images = photo.images ?? [];
      if (images.length === 0) return [];
      return [{
        id: photo.id,
        createdTime: photo.created_time,
        caption: firstLine(photo.name ?? ""),
        small: pickImage(images, SMALL_WIDTH),
        large: pickImage(images, LARGE_WIDTH),
      }];
    })
    .sort((a, b) => parseFacebookDate(b.createdTime).getTime() - parseFacebookDate(a.createdTime).getTime());
}

/** The smallest image at least `width` wide, or the largest there is. Facebook offers each photo in several sizes. */
export function pickImage(images: { source: string; width: number; height: number }[], width: number): Picture {
  const bySize = [...images].sort((a, b) => a.width - b.width);
  const chosen = bySize.find((img) => img.width >= width) ?? bySize[bySize.length - 1];
  return { src: chosen.source, width: chosen.width, height: chosen.height };
}

function firstLine(text: string): string {
  const line = text.split("\n")[0].trim();
  return line.length > 120 ? `${line.slice(0, line.lastIndexOf(" ", 119))} …` : line;
}
