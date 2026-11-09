// News posts as the page shows them: a title from the first line, a Danish date, captions for the photos.

import type { NewsPost } from "../../netlify/lib/types";
import { dayText, parseFacebookDate } from "./dates";
import { titleOf } from "./text";

export interface NewsItem {
  id: string;
  title: string;
  /** »6. november 2026« */
  date: string;
  text: string;
  /** The post on Facebook. */
  link: string | null;
  photos: { src: string; caption: string }[];
  /** A video is not played on the site: its still image links to the post. */
  videoStill: string | null;
}

export function toNewsItem(post: NewsPost): NewsItem {
  const date = dayText(parseFacebookDate(post.createdTime));
  return {
    id: post.id,
    title: titleOf(post.text),
    date,
    text: post.text,
    link: post.link,
    photos: post.photos.map((photo, i) => ({ src: photo.src, caption: `Billede ${i + 1} fra opslaget ${date}` })),
    videoStill: post.videoStill?.src ?? null,
  };
}

export const photoCount = (n: number) => (n === 1 ? "1 billede" : `${n} billeder`);
