// Shared by the functions and the browser code, so it imports nothing.

/** Facebook writes offsets as +0100; Safari cannot parse that without the colon. */
export function parseFacebookDate(text: string): Date {
  return new Date(text.replace(/([+-]\d{2})(\d{2})$/, "$1:$2"));
}
