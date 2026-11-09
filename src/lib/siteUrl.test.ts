import { expect, test } from "vitest";
import { DEFAULT_SITE_URL, siteUrl } from "./siteUrl";

test("a production build uses the site's main address", () => {
  expect(siteUrl({ CONTEXT: "production", URL: "https://kupeen9520.dk", DEPLOY_PRIME_URL: "https://main--kupeen.netlify.app" })).toBe(
    "https://kupeen9520.dk",
  );
});

test("a Deploy Preview uses its own address", () => {
  expect(siteUrl({ CONTEXT: "deploy-preview", URL: "https://kupeen9520.dk", DEPLOY_PRIME_URL: "https://deploy-preview-3--kupeen.netlify.app" })).toBe(
    "https://deploy-preview-3--kupeen.netlify.app",
  );
});

test("a build outside Netlify uses kupeen9520.dk, and a trailing slash is dropped", () => {
  expect(siteUrl({})).toBe(DEFAULT_SITE_URL);
  expect(siteUrl({ CONTEXT: "production", URL: "https://kupeen.netlify.app/" })).toBe("https://kupeen.netlify.app");
});
