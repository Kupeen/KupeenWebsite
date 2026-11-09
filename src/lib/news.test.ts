import { describe, expect, it } from "vitest";
import { photoCount, toNewsItem } from "./news";

describe("news items", () => {
  it("takes the title from the first line and names the photos by the post's date", () => {
    const item = toNewsItem({
      id: "1_2",
      createdTime: "2026-10-29T21:30:00+0000", // 22:30 in Denmark
      text: "Hvad kunne være fedt at lave i Kupéen når man er ung?\n\nKom til en hyggelig aften.",
      link: "https://www.facebook.com/1/posts/2",
      photos: [
        { src: "/api/image/post/1_2/1", width: 720, height: 540 },
        { src: "/api/image/post/1_2/2", width: 720, height: 540 },
      ],
      videoStill: null,
    });
    expect(item.title).toBe("Hvad kunne være fedt at lave i Kupéen når man er ung?");
    expect(item.date).toBe("29. oktober 2026");
    expect(item.photos[1]).toEqual({ src: "/api/image/post/1_2/2", caption: "Billede 2 fra opslaget 29. oktober 2026" });
    expect(item.videoStill).toBeNull();
  });

  it("counts photos in Danish", () => {
    expect(photoCount(1)).toBe("1 billede");
    expect(photoCount(6)).toBe("6 billeder");
  });
});
