// src/pages/RockCountriesPage.tsx
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useSpotifyTop } from "./useSpotifyTop";
import type { TimeRange } from "./spotifyTop";
import { countryName, lookupCountry } from "./musicbrainz";
import {
  DEFAULT_HOURS_PER_DAY,
  RANGE_LABEL,
  estimateArtistMinutes,
  formatMinutes,
} from "./estimate";

interface CountryRow {
  code: string;
  name: string;
  value: number; // artist count or minutes
  percent: number;
}

function toRows(totals: Map<string, number>): CountryRow[] {
  const sum = [...totals.values()].reduce((a, b) => a + b, 0);
  return [...totals.entries()]
    .map(([code, value]) => ({
      code,
      name: countryName(code),
      value,
      percent: sum > 0 ? (value / sum) * 100 : 0,
    }))
    .sort((a, b) => b.value - a.value);
}

function RankTable({
  title,
  rows,
  formatValue,
}: {
  title: string;
  rows: CountryRow[];
  formatValue: (v: number) => string;
}) {
  return (
    <section>
      <h2>{title}</h2>
      {rows.length === 0 ? (
        <p>No data yet.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th scope="col">Country</th>
              <th scope="col">Amount</th>
              <th scope="col">Share</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.code}>
                <td>{r.name}</td>
                <td>{formatValue(r.value)}</td>
                <td>{r.percent.toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

export default function RockCountriesPage() {
  const [range, setRange] = useState<TimeRange>("medium_term");
  const [hoursPerDay, setHoursPerDay] = useState(DEFAULT_HOURS_PER_DAY);
  const [searchParams] = useSearchParams();
  const authCode = searchParams.get("code") ?? "";
  const { artists, loading, error } = useSpotifyTop(range, authCode);

  // Keep each artist's overall rank so the time estimate matches the Top Artists page.
  const rockArtists = useMemo(() => {
    const minutes = estimateArtistMinutes(artists.length, range, hoursPerDay);
    return artists
      .map((artist, i) => ({ artist, minutes: minutes[i] }))
      .filter(({ artist }) =>
        artist.genres.some((g) => g.toLowerCase().includes("rock")),
      );
  }, [artists, range, hoursPerDay]);

  // artist id -> ISO code, null (no match), or missing (not looked up yet)
  const [countries, setCountries] = useState<Record<string, string | null>>({});
  const [lookupError, setLookupError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLookupError(null);

    (async () => {
      for (const { artist } of rockArtists) {
        if (cancelled) return;
        if (artist.id in countries) continue;
        try {
          const code = await lookupCountry(artist.name);
          if (cancelled) return;
          setCountries((prev) => ({ ...prev, [artist.id]: code }));
        } catch (e) {
          if (!cancelled)
            setLookupError(e instanceof Error ? e.message : String(e));
          return;
        }
      }
    })();

    return () => {
      cancelled = true;
    };
    // `countries` is deliberately left out: we only want to restart when the artist list changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rockArtists]);

  const { byCount, byTime, resolved, unknown } = useMemo(() => {
    const count = new Map<string, number>();
    const time = new Map<string, number>();
    let resolved = 0;
    let unknown = 0;
    for (const { artist, minutes } of rockArtists) {
      const code = countries[artist.id];
      if (code === undefined) continue;
      resolved++;
      if (code === null) {
        unknown++;
        continue;
      }
      count.set(code, (count.get(code) ?? 0) + 1);
      time.set(code, (time.get(code) ?? 0) + minutes);
    }
    return { byCount: toRows(count), byTime: toRows(time), resolved, unknown };
  }, [rockArtists, countries]);

  return (
    <main className="rock-countries">
      <h1>Where your rock artists come from</h1>

      <div className="controls">
        <label>
          Period{" "}
          <select
            value={range}
            onChange={(e) => setRange(e.target.value as TimeRange)}
          >
            {(Object.keys(RANGE_LABEL) as TimeRange[]).map((r) => (
              <option key={r} value={r}>
                {RANGE_LABEL[r]}
              </option>
            ))}
          </select>
        </label>{" "}
        <label>
          Hours you listen per day{" "}
          <input
            type="number"
            min={0.5}
            max={16}
            step={0.5}
            value={hoursPerDay}
            onChange={(e) =>
              setHoursPerDay(Math.max(0.5, Number(e.target.value) || 0.5))
            }
          />
        </label>
      </div>

      <p className="note">
        Rock artists are the ones with a “rock” genre tag on Spotify. Countries
        come from MusicBrainz. Listening times are estimates based on your rank.
      </p>

      {loading && <p>Loading your artists…</p>}
      {error && <p role="alert">Couldn’t load your data: {error}</p>}
      {lookupError && <p role="alert">Country lookup stopped: {lookupError}</p>}

      {!loading && rockArtists.length > 0 && (
        <p aria-live="polite">
          Looked up {resolved} of {rockArtists.length} rock artists
          {unknown > 0 &&
            ` (${unknown} without a country, left out of the percentages)`}
          .
          {resolved < rockArtists.length &&
            " This takes about a second per new artist."}
        </p>
      )}

      <RankTable
        title="By number of artists"
        rows={byCount}
        formatValue={(v) => `${v} artists`}
      />
      <RankTable
        title="By listening time"
        rows={byTime}
        formatValue={formatMinutes}
      />
    </main>
  );
}
