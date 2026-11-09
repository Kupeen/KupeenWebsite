// Facebook texts on the page: teasers, titles and clickable links.

/** The text on one line: line breaks and the spaces around them become one space. */
export const flatten = (text: string) => text.replace(/\s*\n+\s*/g, " ").trim();

/** Cut at the last whole word that fits in `max` characters, followed by » …«. Shorter text is returned whole. */
export function cutAtWord(text: string, max: number): string {
  if (text.length <= max) return text;
  const space = text.lastIndexOf(" ", max);
  return `${text.slice(0, space > 0 ? space : max).trimEnd()} …`;
}

/** The start of a post as one paragraph of about 200 characters. */
export const teaser = (text: string, max = 200) => cutAtWord(flatten(text), max);

/** A post's first line, used as its title (Facebook posts have none). */
export const titleOf = (text: string, max = 90) => cutAtWord(text.trim().split("\n")[0].trim(), max);

/** Whether the text is an http(s) address. Facebook fields such as ticket_uri can hold anything. */
export function isWebUrl(text: string | null | undefined): text is string {
  if (!text) return false;
  try {
    const url = new URL(text);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export type TextPart = { text: string } | { url: string };

/** The text split into plain parts and web addresses, so addresses can be shown as links. */
export function splitLinks(text: string): TextPart[] {
  const parts: TextPart[] = [];
  let rest = 0;
  for (const match of text.matchAll(/https?:\/\/[^\s<>"]+/g)) {
    // A full stop, comma or bracket right after an address belongs to the sentence, not to the address.
    const url = match[0].replace(/[.,;:!?)\]]+$/, "");
    const at = match.index;
    if (at > rest) parts.push({ text: text.slice(rest, at) });
    parts.push(isWebUrl(url) ? { url } : { text: url });
    rest = at + url.length;
  }
  if (rest < text.length) parts.push({ text: text.slice(rest) });
  return parts;
}
