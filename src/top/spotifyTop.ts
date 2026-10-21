// src/lib/spotifyTop.ts
// Thin wrapper around the two Spotify "top items" endpoints.
// Requires the OAuth scope: user-top-read

// Your existing helper. It takes the `?code=` value from the Spotify redirect (required).
import { getAccessToken } from "../auth/getAccessToken";

export type TimeRange = "short_term" | "medium_term" | "long_term";

export interface SpotifyImage {
  url: string;
  width: number | null;
  height: number | null;
}

export interface SpotifyArtist {
  id: string;
  name: string;
  genres: string[];
  images: SpotifyImage[];
}

export interface SpotifyAlbum {
  id: string;
  name: string;
  images: SpotifyImage[];
}

export interface SpotifyTrack {
  id: string;
  name: string;
  duration_ms: number;
  album: SpotifyAlbum;
  artists: { id: string; name: string }[];
}

interface Page<T> {
  items: T[];
}

async function spotifyGet<T>(
  path: string,
  params: Record<string, string | number>,
  code: string,
): Promise<T> {
  const token = await getAccessToken(code);
  const qs = new URLSearchParams(
    Object.entries(params).map(([k, v]) => [k, String(v)]),
  ).toString();
  const res = await fetch(`https://api.spotify.com/v1${path}?${qs}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    throw new Error(
      `Spotify ${path} failed: ${res.status} ${await res.text()}`,
    );
  }
  return res.json() as Promise<T>;
}

/**
 * Spotify returns at most 50 items per request and only exposes roughly
 * the top 99 items in total, so we fetch two pages (50 + 49).
 */
async function fetchTop<T>(
  type: "artists" | "tracks",
  range: TimeRange,
  code: string,
): Promise<T[]> {
  const first = await spotifyGet<Page<T>>(
    `/me/top/${type}`,
    {
      time_range: range,
      limit: 50,
      offset: 0,
    },
    code,
  );
  let second: T[] = [];
  try {
    const page = await spotifyGet<Page<T>>(
      `/me/top/${type}`,
      {
        time_range: range,
        limit: 49,
        offset: 50,
      },
      code,
    );
    second = page.items;
  } catch {
    // Second page is a bonus; ignore failures.
  }
  return [...first.items, ...second];
}

export const fetchTopArtists = (range: TimeRange, code: string) =>
  fetchTop<SpotifyArtist>("artists", range, code);
export const fetchTopTracks = (range: TimeRange, code: string) =>
  fetchTop<SpotifyTrack>("tracks", range, code);
