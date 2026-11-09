# KupeenWebsite

Kupeen hjemmeside: Kupéen's homepage, kupeen9520.dk. Kupéen is the volunteer-run culture house of Skørping
Kulturforening, Sverriggårdsvej 3, 9520 Skørping. The site is in Danish and built around the theme »Afgang 9520«: a
station with a split-flap departure board, a train and a ticket office.

The events, the news and the photos come straight from Kupéen's Facebook Page, so whatever the club posts there shows
up on the site by itself. Nobody has to keep a second calendar.

## How it works

```
browser ──▶ /api/events, /api/news, /api/gallery ──▶ Facebook Graph API (with the Page token)
        ──▶ /api/image/…                         ──▶ the picture, fetched from Facebook and passed on
```

- The pages are a React app (Vite, TypeScript). Netlify serves them as static files.
- `/api/…` are Netlify Functions in `netlify/functions/`. They hold the Facebook token, which never reaches the
  browser, and they send only what the page needs.
- Pictures go through `/api/image/…`, so a visitor's browser never contacts Facebook. The function only serves pictures
  of the events, posts and album photos it knows; it cannot be used to fetch anything else.
- Netlify's CDN keeps the lists for an hour and the pictures for a day, so the functions and Facebook are asked rarely.
  A change on Facebook can therefore take up to an hour to show.
- The site sets no cookies and has no tracking, so it needs no cookie banner.

## What is where

```
netlify/functions/   the API: events, news, gallery, image (each file declares its address)
netlify/lib/         server-only code: the Graph API call, which posts count as news, the gallery, the picture passing
public/              files served as they are (the station sign, the favicon)
src/                 the page
index.html           the page's shell
netlify.toml         Netlify's build settings
```

## Running it locally

Needs Node.js 24 or newer.

```bash
npm install
cp .env.example .env      # then fill in the values, see below
npm run dev               # the site and the API on http://localhost:5173
```

`npm test` runs the tests, `npm run typecheck` checks the types, and `npm run build` builds the site into `dist/`.

## Settings

The Facebook settings are environment variables. Locally they go in `.env` (never committed); on Netlify under
Site configuration → Environment variables, with »Functions« included in their scope. After changing a value on
Netlify, deploy again so the functions see it.

| Name | What |
|---|---|
| `FB_PAGE_ID` | The id of Kupéen's Facebook Page. |
| `FB_PAGE_TOKEN` | A Page access token for that Page (read access to its events, posts and photos). |
| `FB_GALLERY_ALBUM_ID` | Optional: the Facebook album the photo section shows. The id is the number after `set=a.` in the album's address on Facebook. Empty: the photo section is left out. |

A Page token can stop working, for example when its data access runs out or a password changes. Then the programme
and the news stay empty and Netlify's function log says »The token is invalid or expired«. Make a new token and
replace `FB_PAGE_TOKEN`. Facebook's Access Token Debugger shows when a token's data access expires.

## Publishing

Netlify builds the site from this repository. `main` is the live site: every push to `main` is published. Work on a
branch and open a pull request; Netlify then builds a preview of it, and merging publishes it.

## Not done yet

- The membership form checks what is typed but does not send it anywhere yet; how sign-ups should reach the club is
  still to be decided.
- The site still tells search engines to skip it (`noindex` in `index.html`). Remove that when it goes live on
  kupeen9520.dk.
