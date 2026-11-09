// Loads one of our /api/… answers once, when the page opens.

import { useEffect, useState } from "react";
import type { FacebookEvent, GalleryPhoto, NewsPost } from "../netlify/lib/types";

export type Loaded<T> = { state: "loading" } | { state: "failed" } | { state: "ready"; data: T };

function useApi<T>(path: string): Loaded<T> {
  const [loaded, setLoaded] = useState<Loaded<T>>({ state: "loading" });
  useEffect(() => {
    const controller = new AbortController();
    fetch(path, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json() as Promise<T>;
      })
      .then((data) => {
        if (!Array.isArray(data)) throw new Error("Unexpected answer");
        setLoaded({ state: "ready", data });
      })
      .catch(() => {
        if (!controller.signal.aborted) setLoaded({ state: "failed" });
      });
    return () => controller.abort();
  }, [path]);
  return loaded;
}

export const useEvents = () => useApi<FacebookEvent[]>("/api/events");
export const useNews = () => useApi<NewsPost[]>("/api/news");
export const useGallery = () => useApi<GalleryPhoto[]>("/api/gallery");
