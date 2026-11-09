// The Facebook Page's latest posts, and which of them count as news.

import { getJson, graphUrl, parseFacebookDate, type FacebookConfig } from "./facebook";
import type { NewsPost, Picture } from "./types";

const MEDIA = "media_type,type,media{image{src,width,height}}";
const FIELDS = `message,created_time,permalink_url,status_type,attachments{${MEDIA},subattachments.limit(100){${MEDIA}}}`;
const POSTS_TO_READ = 50; // about three months of posts
export const MIN_TEXT_LENGTH = 40;

interface Attachment {
  type?: string;
  media_type?: string;
  media?: { image?: { src?: string; width?: number; height?: number } };
  subattachments?: { data?: Attachment[] };
}

export interface FacebookPost {
  id: string;
  created_time: string;
  message?: string;
  permalink_url?: string;
  status_type?: string;
  attachments?: { data?: Attachment[] };
}

/** The Page's latest posts as Facebook sends them (only `data`, never the paging addresses, which carry the token). */
export async function fetchPosts({ pageId, token }: FacebookConfig): Promise<FacebookPost[]> {
  const url = graphUrl(`${encodeURIComponent(pageId)}/posts`, { fields: FIELDS, limit: String(POSTS_TO_READ) }, token);
  const body = await getJson<{ data?: FacebookPost[] }>(url, token);
  return body.data ?? [];
}

/** The news for the homepage, newest first. */
export async function fetchNews(config: FacebookConfig): Promise<NewsPost[]> {
  return newsFromPosts(await fetchPosts(config));
}

export function newsFromPosts(posts: FacebookPost[]): NewsPost[] {
  return posts
    .map(classifyPost)
    .flatMap((result) => ("news" in result ? [result.news] : []))
    .sort((a, b) => parseFacebookDate(b.createdTime).getTime() - parseFacebookDate(a.createdTime).getTime());
}

/**
 * Whether a post counts as news: `{ news }`, or `{ skip }` with the reason. A news post has some text and a photo,
 * an album or a video. Left out: the post Facebook makes by itself for a new event and posts that share an event
 * (reminders), because the programme already shows those events; links and shared posts, whose content is someone
 * else's.
 */
export function classifyPost(post: FacebookPost): { news: NewsPost } | { skip: string } {
  if (post.status_type === "created_event") return { skip: "new event" };
  const attachment = post.attachments?.data?.[0];
  if (attachment?.type === "event") return { skip: "shares an event" };

  const text = cleanText(post.message);
  if (text.length === 0) return { skip: "no text" };
  if (text.length < MIN_TEXT_LENGTH) return { skip: `short text (${text.length} characters)` };

  let photos: (Picture | null)[] = [];
  let videoStill: Picture | null = null;
  switch (attachment?.type) {
    case "photo":
      photos = [image(attachment)];
      break;
    case "album":
      photos = (attachment.subattachments?.data ?? []).filter((item) => item.type === "photo").map(image);
      break;
    case "video_inline":
      videoStill = image(attachment);
      break;
    default:
      return { skip: attachment ? `attachment ${attachment.type}` : "no photo or video" };
  }
  const found = photos.filter((photo): photo is Picture => photo !== null);
  if (found.length === 0 && !videoStill) return { skip: "no photo or video" };

  return {
    news: { id: post.id, createdTime: post.created_time, text, link: post.permalink_url ?? null, photos: found, videoStill },
  };
}

/** The post's text as written, with tidy line breaks and without a closing row of hashtags (common on posts shared from Instagram). */
export function cleanText(message: string | undefined): string {
  return (message ?? "")
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/(\s*#\p{L}[\p{L}\p{N}_]*)+\s*$/u, "")
    .trim();
}

// Image addresses are signed and expire after about a week: never store them, always use fresh answers.
function image(item: Attachment): Picture | null {
  const img = item.media?.image;
  if (!img?.src) return null;
  return { src: img.src, width: img.width ?? null, height: img.height ?? null };
}
