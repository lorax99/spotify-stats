// src/lib/estimate.ts
// Spotify's API gives only RANKS, not minutes. We turn ranks into estimated
// minutes with a simple model:
//   1. You tell us roughly how many hours/day you listen.
//   2. That gives a total number of minutes for the chosen time window.
//   3. We split those minutes across your top N artists using a Zipf-like
//      curve: weight(rank) = 1 / rank^exponent.
// Treat the output as a rough guide, not real data.

import type { TimeRange } from "./spotifyTop";

export const RANGE_DAYS: Record<TimeRange, number> = {
  short_term: 28,
  medium_term: 182,
  long_term: 365,
};

export const RANGE_LABEL: Record<TimeRange, string> = {
  short_term: "Last 4 weeks",
  medium_term: "Last 6 months",
  long_term: "Last 12 months",
};

export const DEFAULT_HOURS_PER_DAY = 2;
export const DEFAULT_EXPONENT = 0.8; // higher = more weight on your #1

export function rankWeight(rankIndex: number, exponent = DEFAULT_EXPONENT): number {
  return 1 / Math.pow(rankIndex + 1, exponent);
}

/** Estimated minutes for each artist, in the same order as the input ranking. */
export function estimateArtistMinutes(
  artistCount: number,
  range: TimeRange,
  hoursPerDay = DEFAULT_HOURS_PER_DAY,
  exponent = DEFAULT_EXPONENT
): number[] {
  const totalMinutes = hoursPerDay * 60 * RANGE_DAYS[range];
  const weights = Array.from({ length: artistCount }, (_, i) => rankWeight(i, exponent));
  const sum = weights.reduce((a, b) => a + b, 0);
  return weights.map((w) => (totalMinutes * w) / sum);
}

export function formatMinutes(minutes: number): string {
  const rounded = Math.round(minutes);
  const h = Math.floor(rounded / 60);
  const m = rounded % 60;
  return h > 0 ? `~${h}h ${m}m` : `~${m}m`;
}
