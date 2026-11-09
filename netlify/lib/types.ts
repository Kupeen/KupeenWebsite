// What the Graph API sends (only the fields we ask for) and what our /api/… answers send to the browser.
// The browser code imports these types too, so both sides agree on the shape.

export interface Picture {
  /** On /api answers: our own address (/api/image/…), never Facebook's. */
  src: string;
  width: number | null;
  height: number | null;
}

/** A Facebook event as /api/events sends it: Facebook's fields, with our own address for the cover. */
export interface FacebookEvent {
  id: string;
  name: string;
  description?: string;
  start_time: string;
  end_time?: string;
  place?: { name?: string };
  cover?: { source: string; offset_x?: number; offset_y?: number; id?: string };
  ticket_uri?: string;
}

/** A Facebook post that counts as news (see posts.ts), as /api/news sends it. */
export interface NewsPost {
  id: string;
  createdTime: string;
  text: string;
  link: string | null;
  photos: Picture[];
  /** A video is not played on the site: its still image links to the post on Facebook. */
  videoStill: Picture | null;
}

/** One photo of the gallery album, as /api/gallery sends it: a small picture for the strip, a large one for viewing. */
export interface GalleryPhoto {
  id: string;
  createdTime: string;
  caption: string;
  small: Picture;
  large: Picture;
}
