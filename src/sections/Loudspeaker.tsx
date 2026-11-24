import { SpeakerIcon } from "../components/Icons";
import type { NewsItem } from "../lib/news";
import { newsAnchor } from "./News";

/**
 * »Højtaleren«: the latest headlines running past, like an announcement on the platform. Each headline leads to its
 * post in the news section, opened. The strip stands still while pointed at or focused (global.css), so it can be
 * clicked.
 */
export function Loudspeaker({ news, onNews, onOpen }: { news: NewsItem[]; onNews: () => void; onOpen: (id: string) => void }) {
  const latest = news.slice(0, 5);
  return (
    <section className="loudspeaker" aria-label="Højtaleren: de seneste nyheder">
      <div className="loudspeaker-inner">
        <a className="loudspeaker-label" href="#nyheder" onClick={onNews}>
          <SpeakerIcon />
          Højtaleren
        </a>
        <div className="loudspeaker-window">
          {/* The headlines run twice in a row, so the marquee can loop without a jump. Screen readers and the keyboard
              get them once. */}
          <div className="marquee">
            {[0, 1].flatMap((copy) =>
              latest.map((item) => (
                <a
                  key={`${copy}-${item.id}`}
                  href={`#${newsAnchor(item.id)}`}
                  aria-hidden={copy ? true : undefined}
                  tabIndex={copy ? -1 : undefined}
                  onClick={(event) => {
                    event.preventDefault();
                    onOpen(item.id);
                  }}
                >
                  Ding-dong! {item.date} · {item.title} ·
                </a>
              )),
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
