import { SpeakerIcon } from "../components/Icons";
import type { NewsItem } from "../lib/news";

/** »Højtaleren«: the latest headlines running past, like an announcement on the platform. */
export function Loudspeaker({ news, onNews }: { news: NewsItem[]; onNews: () => void }) {
  const lines = news.slice(0, 5).map((item) => `Ding-dong! ${item.date} · ${item.title} ·`);
  return (
    <section className="loudspeaker" aria-label="Højtaleren: de seneste nyheder">
      <div className="loudspeaker-inner">
        <a className="loudspeaker-label" href="#nyheder" onClick={onNews}>
          <SpeakerIcon />
          Højtaleren
        </a>
        <div className="loudspeaker-window">
          {/* The lines run twice in a row, so the marquee can loop without a jump. Screen readers get them once. */}
          <div className="marquee">
            {[...lines, ...lines].map((line, i) => (
              <span key={i} aria-hidden={i >= lines.length ? true : undefined}>
                {line}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
