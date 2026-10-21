// src/lib/musicbrainz.ts
// Spotify doesn't know where an artist is from, so we ask MusicBrainz.
// Rules of the free API: max ~1 request/second. We queue requests and cache
// results in localStorage so each artist is only looked up once, ever.

const CACHE_KEY = "mb-artist-country-v1";
const MIN_INTERVAL_MS = 1100;

type Cache = Record<string, string | null>; // lowercased artist name -> ISO country code (or null = not found)

function loadCache(): Cache {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) ?? "{}") as Cache;
  } catch {
    return {};
  }
}

function saveCache(cache: Cache) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // storage full or unavailable; just skip caching
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

let lastCall = 0;
async function throttle() {
  const wait = Math.max(0, lastCall + MIN_INTERVAL_MS - Date.now());
  if (wait > 0) await sleep(wait);
  lastCall = Date.now();
}

interface MbArtist {
  name: string;
  score: number;
  country?: string;
  area?: { "iso-3166-1-codes"?: string[] };
}

/** Returns an ISO 3166-1 code like "US", or null if MusicBrainz has no confident match. */
export async function lookupCountry(artistName: string): Promise<string | null> {
  const key = artistName.toLowerCase();
  const cache = loadCache();
  if (key in cache) return cache[key];

  const query = `artist:"${artistName.replace(/"/g, '\\"')}"`;
  const url = `https://musicbrainz.org/ws/2/artist/?query=${encodeURIComponent(query)}&fmt=json&limit=5`;

  for (let attempt = 0; attempt < 2; attempt++) {
    await throttle();
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (res.status === 503) {
      await sleep(2000); // rate-limited, back off and retry once
      continue;
    }
    if (!res.ok) throw new Error(`MusicBrainz failed: ${res.status}`);

    const data = (await res.json()) as { artists?: MbArtist[] };
    const match = data.artists?.find(
      (a) => a.score >= 90 && a.name.toLowerCase() === key
    );
    const code = match?.country ?? match?.area?.["iso-3166-1-codes"]?.[0] ?? null;

    cache[key] = code;
    saveCache(cache);
    return code;
  }
  throw new Error("MusicBrainz is rate-limiting requests, try again shortly");
}

const regionNames =
  typeof Intl !== "undefined" && "DisplayNames" in Intl
    ? new Intl.DisplayNames(["en"], { type: "region" })
    : null;

export function countryName(code: string): string {
  try {
    return regionNames?.of(code) ?? code;
  } catch {
    return code;
  }
}
