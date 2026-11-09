import { useEffect, useMemo, useState } from "react";
import { useEvents, useGallery, useNews, type Loaded } from "./api";
import { LightboxProvider } from "./components/Lightbox";
import { SECTIONS, type SectionId } from "./content/site";
import { upcomingDepartures, type Departure } from "./lib/board";
import { toNewsItem, type NewsItem } from "./lib/news";
import { About } from "./sections/About";
import { Departures } from "./sections/Departures";
import { Footer } from "./sections/Footer";
import { Header, type MenuItem } from "./sections/Header";
import { Loudspeaker } from "./sections/Loudspeaker";
import { Membership } from "./sections/Membership";
import { News } from "./sections/News";
import { Photos } from "./sections/Photos";
import { Volunteers } from "./sections/Volunteers";
import { Welcome } from "./sections/Welcome";

export function App() {
  const events = useEvents();
  const newsAnswer = useNews();
  const gallery = useGallery();
  const now = useMinute();

  // Events that ended since the server's list was made are dropped by the visitor's clock.
  const departures = useMemo<Loaded<Departure[]>>(
    () => (events.state === "ready" ? { state: "ready", data: upcomingDepartures(events.data, now) } : events),
    [events, now],
  );
  const news = useMemo<Loaded<NewsItem[]>>(() => (newsAnswer.state === "ready" ? { state: "ready", data: newsAnswer.data.map(toNewsItem) } : newsAnswer), [newsAnswer]);
  const photos = gallery.state === "ready" ? gallery.data : [];
  const newsList = news.state === "ready" ? news.data : [];

  // The photo section is left out while the album is empty; the menu and the »perron« numbers follow what is shown.
  const menu = useMemo<MenuItem[]>(
    () => SECTIONS.filter((s) => s.id !== "billeder" || photos.length > 0).map((s, i) => ({ ...s, number: i + 1 })),
    [photos.length],
  );
  const numberOf = (id: SectionId) => menu.find((item) => item.id === id)?.number ?? 0;
  const [current, setCurrent] = useCurrentSection(menu);

  return (
    <LightboxProvider>
      <div className="page">
        <Header menu={menu} current={current} onPick={setCurrent} />
        <main>
          <Welcome
            number={numberOf("forside")}
            next={departures.state === "ready" ? (departures.data[0] ?? null) : null}
            latest={newsList[0] ?? null}
            onNews={() => setCurrent("nyheder")}
          />
          <Departures number={numberOf("aktiviteter")} departures={departures} />
          {newsList.length > 0 && <Loudspeaker news={newsList} onNews={() => setCurrent("nyheder")} />}
          <News number={numberOf("nyheder")} news={news} />
          {photos.length > 0 && <Photos number={numberOf("billeder")} photos={photos} />}
          <Volunteers number={numberOf("frivillig")} photo={photos[0] ?? null} />
          <About number={numberOf("om-os")} />
          <Membership number={numberOf("bliv-medlem")} />
        </main>
        <Footer />
      </div>
    </LightboxProvider>
  );
}

/** The time, updated every minute: enough to drop events that have ended. */
function useMinute(): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);
  return now;
}

/** The section being read: the last one whose top has passed a third of the window. A click in the menu sets it at once. */
function useCurrentSection(menu: MenuItem[]): [SectionId, (id: SectionId) => void] {
  const [current, setCurrent] = useState<SectionId>("forside");
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const line = window.innerHeight / 3;
      let found: SectionId = menu[0].id;
      for (const item of menu) {
        const section = document.getElementById(item.id);
        if (section && section.getBoundingClientRect().top <= line) found = item.id;
      }
      // At the very bottom the last section counts, even if it is too short to reach the line.
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) found = menu[menu.length - 1].id;
      setCurrent(found);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [menu]);
  return [current, setCurrent];
}
