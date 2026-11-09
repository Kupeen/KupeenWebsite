import { useState } from "react";
import type { Loaded } from "../api";
import { CameraIcon, ChevronIcon, PlayIcon } from "../components/Icons";
import { Kicker } from "../components/Kicker";
import { useLightbox } from "../components/Lightbox";
import { RichText } from "../components/RichText";
import { FACEBOOK_PAGE_URL } from "../content/site";
import { photoCount, type NewsItem } from "../lib/news";
import { flatten, teaser } from "../lib/text";

/** Without »Vis ældre nyheder«: the featured post and the three after it. */
const FIRST_SHOWN = 4;

/** Perron 3: the Facebook Page's latest posts that count as news. */
export function News({ number, news }: { number: number; news: Loaded<NewsItem[]> }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const list = news.state === "ready" ? news.data : [];
  const [featured, ...rest] = list;
  const toggle = (id: string) => setOpenId((current) => (current === id ? null : id));

  return (
    <section id="nyheder" className="wrap news">
      <Kicker number={number} colour="var(--pink)">
        PERRON {number} · NYHEDER
      </Kicker>
      <h2 className="heading" style={{ color: "var(--pink)", marginBottom: 8 }}>
        Nyt fra perronen
      </h2>
      <p className="lead">Det seneste fra Kupéens Facebook-side: billeder fra koncerter og fester, tak for sidst og hvad der er på vej.</p>

      {news.state === "loading" && <p className="notice">Henter nyheder …</p>}
      {news.state === "failed" && (
        <p className="notice">
          Nyhederne kunne ikke hentes lige nu. <a href={FACEBOOK_PAGE_URL}>Se dem på Kupéens Facebook-side</a>.
        </p>
      )}
      {news.state === "ready" && list.length === 0 && (
        <p className="notice">
          Ingen nyheder lige nu. <a href={FACEBOOK_PAGE_URL}>Følg Kupéen på Facebook</a>.
        </p>
      )}

      {featured && <Featured item={featured} open={openId === featured.id} onToggle={() => toggle(featured.id)} />}
      {rest.length > 0 && (
        <div className="news-grid">
          {rest.slice(0, showAll ? rest.length : FIRST_SHOWN - 1).map((item) => (
            <NewsCard key={item.id} item={item} open={openId === item.id} onToggle={() => toggle(item.id)} />
          ))}
        </div>
      )}
      {list.length > FIRST_SHOWN && (
        <button type="button" className="more-button" onClick={() => setShowAll(!showAll)}>
          {showAll ? "Vis færre nyheder" : "Vis ældre nyheder"}
        </button>
      )}
    </section>
  );
}

/** The post's text: the first 200 characters, or all of it once opened. */
function useText(item: NewsItem, open: boolean) {
  const short = teaser(item.text);
  return { text: open ? item.text : short, canExpand: short !== flatten(item.text) };
}

function Featured({ item, open, onToggle }: { item: NewsItem; open: boolean; onToggle: () => void }) {
  const lightbox = useLightbox();
  const { text, canExpand } = useText(item, open);
  const showPhotos = (index = 0) => lightbox(item.title, item.photos, index);
  return (
    <article className="featured">
      {item.photos.length > 0 && (
        <div className="featured-media">
          <button type="button" className="photo-button featured-cover" onClick={() => showPhotos()} aria-label={`Se ${photoCount(item.photos.length)} fra ${item.title}`}>
            <img src={item.photos[0].src} alt={item.photos[0].caption} />
            <span className="photo-badge">
              <CameraIcon />
              {photoCount(item.photos.length)} · Se billederne
            </span>
          </button>
          {item.photos.length > 1 && (
            <div className="thumbs">
              {item.photos.slice(0, 6).map((photo, i) => (
                <button key={photo.src} type="button" className="photo-button" onClick={() => showPhotos(i)} aria-label={`Se billedet stort: ${photo.caption}`}>
                  <img src={photo.src} alt="" loading="lazy" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
      {item.photos.length === 0 && item.videoStill && (
        <div className="featured-media">
          <VideoLink item={item} className="photo-button featured-cover" />
        </div>
      )}
      <div className="featured-text">
        <div className="news-tag">
          <span>Seneste nyt</span>
          {item.date}
        </div>
        <p className="news-body">
          <RichText text={text} />
        </p>
        <div className="button-row">
          {canExpand && (
            <button type="button" className="solid-button" onClick={onToggle} aria-expanded={open}>
              {open ? "Luk" : "Læs mere"} <ChevronIcon open={open} />
            </button>
          )}
          {item.photos.length > 0 && (
            <button type="button" className="pink-button" onClick={() => showPhotos()}>
              <CameraIcon />
              Se billederne
            </button>
          )}
        </div>
        {item.link && (
          <div className="featured-link">
            <a href={item.link} target="_blank" rel="noopener noreferrer">
              Se opslaget på Facebook
            </a>
          </div>
        )}
      </div>
    </article>
  );
}

function NewsCard({ item, open, onToggle }: { item: NewsItem; open: boolean; onToggle: () => void }) {
  const lightbox = useLightbox();
  const { text, canExpand } = useText(item, open);
  return (
    <article className="news-card">
      {item.photos.length > 0 && (
        <button type="button" className="photo-button" onClick={() => lightbox(item.title, item.photos)} aria-label={`Se ${photoCount(item.photos.length)} fra ${item.title}`}>
          <img src={item.photos[0].src} alt={item.photos[0].caption} loading="lazy" />
          <span className="photo-badge">
            <CameraIcon />
            {photoCount(item.photos.length)}
          </span>
        </button>
      )}
      {item.photos.length === 0 && item.videoStill && <VideoLink item={item} className="photo-button" />}
      <div className="news-card-text">
        <div className="news-date">{item.date}</div>
        <p>
          <RichText text={text} />
        </p>
        <div className="news-card-actions">
          {canExpand && (
            <button type="button" className="gold-outline-button" onClick={onToggle} aria-expanded={open}>
              {open ? "Luk" : "Læs mere"} <ChevronIcon open={open} />
            </button>
          )}
          {item.link && (
            <a href={item.link} target="_blank" rel="noopener noreferrer">
              Se på Facebook
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

/** A video is not played here: its still image links to the post on Facebook. */
function VideoLink({ item, className }: { item: NewsItem; className: string }) {
  const still = <img src={item.videoStill ?? ""} alt="" loading="lazy" />;
  const badge = (
    <span className="photo-badge">
      <PlayIcon />
      Video · ses på Facebook
    </span>
  );
  return item.link ? (
    <a className={className} href={item.link} target="_blank" rel="noopener noreferrer" aria-label="Se videoen på Facebook">
      {still}
      {badge}
    </a>
  ) : (
    <div className={className}>{still}</div>
  );
}
