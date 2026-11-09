import { useState } from "react";
import type { GalleryPhoto } from "../../netlify/lib/types";
import { CameraIcon } from "../components/Icons";
import { Kicker } from "../components/Kicker";
import { useLightbox } from "../components/Lightbox";

/**
 * Perron 4, »Udsigt fra kupéen«: the gallery album's photos glide past like the view from a train window. Only shown
 * when the album has photos.
 */
export function Photos({ number, photos }: { number: number; photos: GalleryPhoto[] }) {
  const lightbox = useLightbox();
  const [paused, setPaused] = useState(false);
  const large = photos.map((p) => ({ src: p.large.src, caption: p.caption }));
  const show = (index: number, title = "Udsigt fra kupéen") => lightbox(title, large, index);

  return (
    <section id="billeder" className="photos">
      <div className="wrap">
        <Kicker number={number} colour="var(--sky)" inverted>
          PERRON {number} · BILLEDER
        </Kicker>
        <div className="photos-head">
          <h2 className="heading">Udsigt fra kupéen</h2>
          <div className="photos-buttons">
            <button type="button" onClick={() => setPaused(!paused)} aria-pressed={paused}>
              {paused ? "▶ Kør videre" : "❚❚ Stop udsigten"}
            </button>
            <button type="button" className="dark" onClick={() => show(0, "Stemningsbilleder fra Kupéen")}>
              <CameraIcon />
              Se alle {photos.length} billeder
            </button>
          </div>
        </div>
        <p className="lead">
          Stemningsbilleder fra koncerter, strik, krea og fester i Kupéen. Udsigten glider forbi af sig selv – hold musen over et vindue for at
          stoppe, og klik for at se billedet stort.
        </p>
      </div>
      <div className={paused ? "view paused" : "view"}>
        {/* The strip runs twice in a row so it can loop without a jump; only the first copy is reachable. */}
        <div className="view-track">
          {[0, 1].flatMap((copy) =>
            photos.map((photo, i) => (
              <figure key={`${copy}-${photo.id}`} aria-hidden={copy ? true : undefined}>
                <button
                  type="button"
                  className="photo-button"
                  tabIndex={copy ? -1 : 0}
                  onClick={() => show(i)}
                  aria-label={`Se billedet stort${photo.caption ? `: ${photo.caption}` : ""}`}
                >
                  <img src={photo.small.src} alt="" loading="lazy" />
                  <span className="window-shine" aria-hidden="true" />
                </button>
                {photo.caption && <figcaption>{photo.caption}</figcaption>}
              </figure>
            )),
          )}
        </div>
      </div>
      <div className="track-strip" aria-hidden="true" />
    </section>
  );
}
