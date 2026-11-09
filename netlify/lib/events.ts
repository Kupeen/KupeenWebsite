// The Facebook Page's upcoming events.

import { getJson, graphUrl, parseFacebookDate, type FacebookConfig } from "./facebook";
import type { FacebookEvent } from "./types";

const FIELDS = "name,description,start_time,end_time,place,cover,ticket_uri";
const MAX_PAGES = 10;

interface EventList {
  data?: FacebookEvent[];
  paging?: { next?: string };
}

/** The upcoming events, soonest first. */
export async function fetchUpcomingEvents({ pageId, token }: FacebookConfig): Promise<FacebookEvent[]> {
  let url: string | undefined = graphUrl(`${encodeURIComponent(pageId)}/events`, { time_filter: "upcoming", fields: FIELDS, limit: "100" }, token);
  const events: FacebookEvent[] = [];
  for (let page = 0; url && page < MAX_PAGES; page++) {
    const body: EventList = await getJson<EventList>(url, token);
    events.push(...(body.data ?? []));
    url = body.paging?.next;
  }
  return events.sort((a, b) => parseFacebookDate(a.start_time).getTime() - parseFacebookDate(b.start_time).getTime());
}
