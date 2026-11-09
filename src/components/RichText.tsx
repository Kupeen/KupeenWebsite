import { splitLinks } from "../lib/text";

/** A Facebook text with its web addresses as links. Line breaks are kept by the surrounding `white-space: pre-line`. */
export function RichText({ text }: { text: string }) {
  return (
    <>
      {splitLinks(text).map((part, i) =>
        "url" in part ? (
          <a key={i} href={part.url} target="_blank" rel="noopener noreferrer nofollow">
            {part.url}
          </a>
        ) : (
          <span key={i}>{part.text}</span>
        ),
      )}
    </>
  );
}
