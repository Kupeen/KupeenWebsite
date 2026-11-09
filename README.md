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
netlify/lib/         the functions' code: the Graph API call, which posts count as news, the gallery, the picture
                     passing; types.ts and dates.ts are shared with the page
public/              files served as they are (the favicon, the share picture)
src/images/          pictures the page itself uses (the station sign)
src/App.tsx          the page: loads the API answers and puts the sections together
src/sections/        one file per section (»perron«), in page order, plus the header and the footer
src/components/      parts used by the sections: the departure board, the ticket, the train, the photo viewer, …
src/lib/             logic without React, with tests: Danish dates, the board, news, texts, the membership form,
                     the site's own address for link previews
src/content/site.ts  the fixed texts: welcome, volunteers, »Vælg din kupé«, the membership cards, contact details
src/styles/          the stylesheet, colours first
index.html           the page's shell
netlify.toml         Netlify's build settings
```

The site that was on kupeen9520.dk before had a page per subject (`/aktiviteter`, `/bliv-medlem`, `/om-os`,
`/gode-ideer`); `netlify.toml` sends those addresses to the matching section, and the page scrolls to the section
named after `#` once the lists have loaded.

A shared link shows `public/share-image.jpg` (1200×630) with the title and description from `index.html`. The build
writes the site's own address into those tags (`src/lib/siteUrl.ts`), so publish once more after the domain changes.
Facebook keeps a picture by its address: give a new share picture a new file name, then let Facebook's Sharing
Debugger read the page again.

Dates are always shown in Danish time, whatever the visitor's own time zone. The board drops an event once it is over
by the visitor's clock (Facebook's end time, or three hours after the start). The photo section only shows when
`FB_GALLERY_ALBUM_ID` is set and the album has photos; the menu and the »perron« numbers follow.

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
Project configuration → Environment variables (they reach the functions by default; on paid plans, keep »Functions«
in their scope). After changing a value on Netlify, deploy again so the functions see it.

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

### Staying within Netlify's free plan

The free plan has a fixed monthly allowance of credits. When it is used up, Netlify takes the site offline until the
next month; it never sends a bill. What uses credits, and what the site does about it:

- **Publishing:** each push to `main` costs as much as several hundred visits. Previews of pull requests cost
  nothing, so collect changes on a branch and merge them together.
- **Bandwidth:** about 1 MB per visit, mostly pictures. The station sign is a small WebP, and browsers keep the built
  files in `/assets/` for a year (their names change when their content does, see `netlify.toml`).
- **The functions:** the CDN keeps lists an hour and pictures a day, a missing picture 5 minutes and a failed Facebook
  call 1 minute (`netlify/lib/http.ts`), so the functions run rarely even when something is wrong.
- **Pictures asked for over and over:** `/api/image/…` answers at most 300 requests a minute from one address, then
  429 (`rateLimit` in `netlify/functions/image.mts`, enforced by Netlify on deployed sites).

Netlify emails the account owner at 50 %, 75 % and 100 % of the month's credits; the account's usage page shows what
each day used.

## Not done yet

- The membership form checks what is typed but does not send it anywhere yet: »Send« asks people to write to the club
  by email instead. How sign-ups should reach the club is still to be decided; `sendApplication` in
  `src/lib/membership.ts` is the one place to connect it, and the receipt is ready for when it is.
- The site still tells search engines to skip it (`noindex` in `index.html`). Remove that when it goes live on
  kupeen9520.dk.
