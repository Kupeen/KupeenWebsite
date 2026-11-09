import { expect, test } from "vitest";
import { classifyPost, cleanText, newsFromPosts, type FacebookPost } from "./posts";

const TEXT = "Tak for en dejlig aften i Kupéen, og tak til alle de frivillige bag baren.";
const photo = (n: number, type = "photo") => ({ type, media_type: type, media: { image: { src: `https://img.test/${n}.jpg`, width: 720, height: 960 } } });
const post = (fields: Partial<FacebookPost> & Record<string, unknown>): FacebookPost => ({
  id: "1_2",
  created_time: "2026-11-06T06:31:39+0000",
  permalink_url: "https://www.facebook.com/1/posts/2",
  status_type: "added_photos",
  message: TEXT,
  ...fields,
});

test("a photo post becomes news with its photo, text, date and link", () => {
  expect(classifyPost(post({ attachments: { data: [photo(1)] } }))).toEqual({
    news: {
      id: "1_2",
      createdTime: "2026-11-06T06:31:39+0000",
      text: TEXT,
      link: "https://www.facebook.com/1/posts/2",
      photos: [{ src: "https://img.test/1.jpg", width: 720, height: 960 }],
      videoStill: null,
    },
  });
});

test("an album keeps its photos in order and leaves out its videos", () => {
  const album = { type: "album", media_type: "album", subattachments: { data: [photo(1), photo(9, "video"), photo(2)] } };
  const result = classifyPost(post({ attachments: { data: [album] } }));
  expect("news" in result && result.news.photos.map((p) => p.src)).toEqual(["https://img.test/1.jpg", "https://img.test/2.jpg"]);
});

test("a video post brings its still image, not the video", () => {
  const result = classifyPost(post({ status_type: "added_video", attachments: { data: [photo(5, "video_inline")] } }));
  expect("news" in result && result.news.photos).toEqual([]);
  expect("news" in result && result.news.videoStill?.src).toBe("https://img.test/5.jpg");
});

test("event posts, links, shared posts and posts without media are left out", () => {
  const cases: [FacebookPost, string][] = [
    [post({ status_type: "created_event", message: "", attachments: { data: [{ type: "event" }] } }), "new event"],
    [post({ status_type: "mobile_status_update", attachments: { data: [{ type: "event" }] } }), "shares an event"],
    [post({ status_type: "mobile_status_update", attachments: { data: [{ type: "native_templates", media_type: "link" }] } }), "attachment native_templates"],
    [post({ status_type: "shared_story", attachments: { data: [{ type: "share", media_type: "link" }] } }), "attachment share"],
    [post({ status_type: "mobile_status_update" }), "no photo or video"],
    [post({ attachments: { data: [{ type: "album", subattachments: { data: [photo(9, "video")] } }] } }), "no photo or video"],
  ];
  for (const [input, reason] of cases) expect(classifyPost(input)).toEqual({ skip: reason });
});

test("posts with no or very short text are left out", () => {
  expect(classifyPost(post({ message: undefined, attachments: { data: [photo(1)] } }))).toEqual({ skip: "no text" });
  expect(classifyPost(post({ message: "Quiz i Kupern", attachments: { data: [photo(1)] } }))).toEqual({ skip: "short text (13 characters)" });
});

test("the text keeps its words and paragraphs but loses a closing row of hashtags", () => {
  expect(cleanText("Har du husket at hapse en billet til @yungholgi her d. 24/10? #rebild #kupeen #legobygger123")).toBe(
    "Har du husket at hapse en billet til @yungholgi her d. 24/10?"
  );
  expect(cleanText("  Oktober i Kupéen\r\n\r\n\r\n\r\nVi ses!  \n")).toBe("Oktober i Kupéen\n\nVi ses!");
  expect(cleanText("Mød #Kupéen i aften, kl. 19")).toBe("Mød #Kupéen i aften, kl. 19");
  expect(cleanText("#skørping #hjemmelyd")).toBe("");
});

test("news comes newest first and carries nothing but the news fields", () => {
  const older = post({ id: "old", created_time: "2026-10-01T10:00:00+0000", attachments: { data: [photo(1)] } });
  const newer = post({ id: "new", created_time: "2026-11-01T10:00:00+0000", attachments: { data: [photo(2)] }, extra: "x" });
  const skipped = post({ id: "event", status_type: "created_event" });
  const news = newsFromPosts([older, skipped, newer]);
  expect(news.map((n) => n.id)).toEqual(["new", "old"]);
  expect(Object.keys(news[0]).sort()).toEqual(["createdTime", "id", "link", "photos", "text", "videoStill"]);
});
