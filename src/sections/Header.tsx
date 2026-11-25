import { useEffect, useRef, useState, type CSSProperties, type MouseEvent, type RefObject } from "react";
import type { SectionId } from "../content/site";
import signImage from "../images/skorping-sign.webp";

export interface MenuItem {
  id: SectionId;
  label: string;
  colour: string;
  number: number;
}

/**
 * The header stays at the top while the page scrolls. One line: the menu, one »perron« per section, then a small
 * tagline and on the right the old station sign that hangs in Kupéen; on narrow screens the sign and the tagline sit
 * on top and the menu below them. The menu is always one row: when its buttons do not fit, it can be swiped sideways
 * (see .header-bar in global.css).
 */
export function Header({ menu, current, onPick }: { menu: MenuItem[]; current: SectionId; onPick: (id: SectionId) => void }) {
  const header = useRef<HTMLElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const overflows = useHeaderSize(header, list, menu.length);
  useCurrentInView(list, current);

  return (
    <header ref={header} className="site-header">
      <div className="header-bar">
        {/* Like a logo, the sign leads back to the start: the plain address, at the top of the page. */}
        <a className="sign" href="/" aria-label="Skørping, til forsiden" onClick={(event) => goHome(event, () => onPick("forside"))}>
          {/* The lettering is traced from a photo of the sign; the worn navy enamel is drawn. */}
          <img src={signImage} alt="" width={360} height={60} />
          <span className="sign-rail" aria-hidden="true" />
          <span className="sign-bolt" aria-hidden="true" />
          <span className="sign-bolt right" aria-hidden="true" />
        </a>
        <p className="tagline">
          KULTURHUS 9520
          <br />
          LIVEMUSIK · BAR · MØDESTED
        </p>
        <nav aria-label="Hovedmenu">
          <ul ref={list} className={overflows ? "menu overflows" : "menu"}>
            {menu.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  onClick={() => onPick(item.id)}
                  aria-current={item.id === current ? "page" : undefined}
                  style={{ "--colour": item.colour } as CSSProperties}
                >
                  <span className="kicker-number" aria-hidden="true">
                    {item.number}
                  </span>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}

/**
 * A plain click on the sign: back to the top and the plain address (no #section), without loading the page again.
 * A click with a modifier key (new tab, new window) is left to the browser, which opens "/" as a normal link.
 */
function goHome(event: MouseEvent<HTMLAnchorElement>, onHome: () => void) {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  if (window.location.pathname + window.location.search + window.location.hash !== "/") window.history.pushState(null, "", "/");
  const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top: 0, behavior: still ? "instant" : "smooth" });
  onHome();
}

/**
 * Keeps `--header-height` on the page up to date, so a jump to a section stops below the header instead of under it
 * (`scroll-padding-top` in global.css), and says whether the menu is wider than its row (then it fades out on the
 * right, a hint that it can be swiped).
 */
function useHeaderSize(header: RefObject<HTMLElement | null>, list: RefObject<HTMLUListElement | null>, items: number): boolean {
  const [overflows, setOverflows] = useState(false);
  useEffect(() => {
    const element = header.current;
    const menu = list.current;
    if (!element || !menu) return;
    const update = () => {
      document.documentElement.style.setProperty("--header-height", `${element.offsetHeight}px`);
      setOverflows(menu.scrollWidth > menu.clientWidth + 1);
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    observer.observe(menu);
    return () => observer.disconnect();
  }, [header, list, items]);
  return overflows;
}

/** When the menu is swiped sideways, the button of the section being read is moved into view. */
function useCurrentInView(list: RefObject<HTMLUListElement | null>, current: SectionId) {
  useEffect(() => {
    const menu = list.current;
    const active = menu?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!menu || !active || menu.scrollWidth <= menu.clientWidth) return;
    const item = active.getBoundingClientRect();
    const row = menu.getBoundingClientRect();
    const fade = 40; // the faded edge on the right
    if (item.left < row.left) menu.scrollBy({ left: item.left - row.left - 8, behavior: "smooth" });
    else if (item.right > row.right - fade) menu.scrollBy({ left: item.right - row.right + fade, behavior: "smooth" });
  }, [list, current]);
}
