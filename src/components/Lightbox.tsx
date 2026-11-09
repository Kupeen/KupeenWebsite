// The photo viewer: one photo large over a dimmed page, with the others of the same set as thumbnails.
// Escape closes it, the arrow keys step through the photos, and focus returns to what opened it.

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowIcon } from "./Icons";

export interface ViewerPhoto {
  src: string;
  caption: string;
}

interface Shown {
  title: string;
  photos: ViewerPhoto[];
  index: number;
}

type Open = (title: string, photos: ViewerPhoto[], index?: number) => void;

const LightboxContext = createContext<Open>(() => {});

/** Opens the photo viewer: `useLightbox()(title, photos, index)`. */
export const useLightbox = () => useContext(LightboxContext);

export function LightboxProvider({ children }: { children: ReactNode }) {
  const [shown, setShown] = useState<Shown | null>(null);
  const opener = useRef<HTMLElement | null>(null);

  const open = useCallback<Open>((title, photos, index = 0) => {
    if (photos.length === 0) return;
    opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setShown({ title, photos, index });
  }, []);

  const close = useCallback(() => {
    setShown(null);
    opener.current?.focus({ preventScroll: true });
  }, []);

  return (
    <LightboxContext.Provider value={open}>
      {children}
      {shown && <Viewer shown={shown} show={(index) => setShown({ ...shown, index })} close={close} />}
    </LightboxContext.Provider>
  );
}

function Viewer({ shown, show, close }: { shown: Shown; show: (index: number) => void; close: () => void }) {
  const { title, photos } = shown;
  const count = photos.length;
  const index = ((shown.index % count) + count) % count;
  const photo = photos[index];
  const dialog = useRef<HTMLDivElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeButton.current?.focus({ preventScroll: true });
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
    };
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      else if (event.key === "ArrowRight" && count > 1) show(index + 1);
      else if (event.key === "ArrowLeft" && count > 1) show(index - 1 + count);
      else if (event.key === "Tab") keepFocusInside(event, dialog.current);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [close, show, index, count]);

  return (
    <>
      <div className="viewer-backdrop" onClick={close} />
      <div ref={dialog} className="viewer" role="dialog" aria-modal="true" aria-label={title}>
        <div className="viewer-head">
          <div>
            <div className="viewer-counter">
              {index + 1} / {count}
            </div>
            <div className="viewer-title">{title}</div>
          </div>
          <button ref={closeButton} type="button" className="viewer-close" onClick={close} aria-label="Luk billedvisningen">
            ×
          </button>
        </div>
        <div className="viewer-stage">
          <img src={photo.src} alt={photo.caption} />
          {count > 1 && (
            <>
              <button type="button" className="viewer-step previous" onClick={() => show(index - 1 + count)} aria-label="Forrige billede">
                <ArrowIcon direction="previous" />
              </button>
              <button type="button" className="viewer-step next" onClick={() => show(index + 1)} aria-label="Næste billede">
                <ArrowIcon direction="next" />
              </button>
            </>
          )}
        </div>
        {photo.caption && <p className="viewer-caption">{photo.caption}</p>}
        {count > 1 && (
          <div className="viewer-thumbs">
            {photos.map((p, i) => (
              <button
                key={`${p.src}-${i}`}
                type="button"
                onClick={() => show(i)}
                aria-label={`Billede ${i + 1}${p.caption ? `: ${p.caption}` : ""}`}
                aria-current={i === index ? "true" : "false"}
              >
                <img src={p.src} alt="" />
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

/** Tab and Shift-Tab go round the viewer's buttons instead of leaving it for the page behind. */
function keepFocusInside(event: KeyboardEvent, container: HTMLElement | null) {
  if (!container) return;
  const items = Array.from(container.querySelectorAll<HTMLElement>("button, a[href]"));
  if (items.length === 0) return;
  const first = items[0];
  const last = items[items.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  } else if (!container.contains(document.activeElement)) {
    event.preventDefault();
    first.focus();
  }
}
