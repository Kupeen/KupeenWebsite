// A small in-memory cache for one function instance. Netlify's CDN in front of the functions does the real caching
// (see http.ts); this keeps a warm instance from asking Facebook again for each of the ~20 pictures a page loads.

/** Wraps `load` so it runs at most once per `seconds`; calls that arrive while it runs share its answer. */
export function cached<T>(load: () => Promise<T>, seconds = 3600, now: () => number = Date.now): () => Promise<T> {
  let kept: { at: number; value: T } | null = null;
  let pending: Promise<T> | null = null;

  return () => {
    if (kept && now() - kept.at < seconds * 1000) return Promise.resolve(kept.value);
    pending ??= load()
      .then((value) => {
        kept = { at: now(), value };
        return value;
      })
      .catch((err: unknown) => {
        // An old answer beats an error; errors are never kept.
        if (kept) return kept.value;
        throw err;
      })
      .finally(() => {
        pending = null;
      });
    return pending;
  };
}
