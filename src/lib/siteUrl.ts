// The site's own address, without a trailing slash, for the link preview tags in index.html: Facebook and others
// want full addresses there. vite.config.ts fills it in at build time.

/** The address used when the build does not know a better one (local builds). */
export const DEFAULT_SITE_URL = "https://kupeen9520.dk";

/**
 * Netlify sets these during its build: `URL` is the site's main address (the custom domain once there is one, until
 * then the netlify.app address), `DEPLOY_PRIME_URL` the address of a Deploy Preview or branch deploy, and `CONTEXT`
 * which of them is being built. A preview points at its own address, so its preview image is its own too.
 */
export function siteUrl(env: Record<string, string | undefined>): string {
  const url = env.CONTEXT === "production" ? env.URL : (env.DEPLOY_PRIME_URL ?? env.URL);
  return (url || DEFAULT_SITE_URL).replace(/\/+$/, "");
}
