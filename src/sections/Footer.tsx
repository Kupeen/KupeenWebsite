import { ADDRESS, FACEBOOK_PAGE_URL } from "../content/site";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-track" aria-hidden="true" />
      <div className="footer-inner">
        <span className="footer-name">Kupéen</span>
        <span>
          Kupéen • {ADDRESS.street} • {ADDRESS.zip} {ADDRESS.town}
        </span>
        <a href={FACEBOOK_PAGE_URL}>Kupéen på Facebook</a>
      </div>
    </footer>
  );
}
