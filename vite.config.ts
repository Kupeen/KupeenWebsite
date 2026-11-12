import netlify from "@netlify/vite-plugin";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";
import { siteUrl } from "./src/lib/siteUrl";

// The Netlify plugin runs the functions in netlify/functions/ inside `npm run dev`, so /api/… works locally too.
// The site uses no Edge Functions and no Netlify Database, so their local emulators stay off.
export default defineConfig({
  plugins: [react(), netlify({ edgeFunctions: { enabled: false }, database: { enabled: false } }), fillSiteUrl()],
  // Two pages: the front page and the privacy page (/privatliv, see netlify.toml).
  build: { rollupOptions: { input: { main: "index.html", privatliv: "privatliv.html" } } },
});

/** Writes the site's own address into index.html wherever it says %SITE_URL% (the link preview tags). */
function fillSiteUrl(): Plugin {
  const url = siteUrl(process.env);
  return {
    name: "kupeen-site-url",
    transformIndexHtml: { order: "pre", handler: (html) => html.replaceAll("%SITE_URL%", url) },
  };
}
