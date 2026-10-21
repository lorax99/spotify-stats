// src/pages/TopArtistsPage.tsx
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useSpotifyTop } from "./useSpotifyTop";
import type { SpotifyAlbum, SpotifyTrack, TimeRange } from "./spotifyTop";
import {
  DEFAULT_EXPONENT,
  DEFAULT_HOURS_PER_DAY,
  RANGE_LABEL,
  estimateArtistMinutes,
  formatMinutes,
  rankWeight,
} from "./estimate";

/** Best-ranked track by this artist, and the album with the most weight among their top tracks. */
function pickFavourites(artistId: string, tracks: SpotifyTrack[]) {
  const mine = tracks
    .map((track, i) => ({ track, weight: rankWeight(i, DEFAULT_EXPONENT) }))
    .filter(({ track }) => track.artists.some((a) => a.id === artistId));

  if (mine.length === 0) return null;

  const albums = new Map<string, { album: SpotifyAlbum; score: number }>();
  for (const { track, weight } of mine) {
    const entry = albums.get(track.album.id);
    if (entry) entry.score += weight;
    else albums.set(track.album.id, { album: track.album, score: weight });
  }
  const topAlbum = [...albums.values()].sort((a, b) => b.score - a.score)[0]
    .album;

  return { song: mine[0].track, album: topAlbum };
}

export default function TopArtistsPage() {
  const [range, setRange] = useState<TimeRange>("medium_term");
  const [hoursPerDay, setHoursPerDay] = useState(DEFAULT_HOURS_PER_DAY);
  const [searchParams] = useSearchParams();
  const code = searchParams.get("code") ?? "";
  const { artists, tracks, loading, error } = useSpotifyTop(range, code);

  const rows = useMemo(() => {
    const minutes = estimateArtistMinutes(artists.length, range, hoursPerDay);
    return artists.map((artist, i) => ({
      artist,
      minutes: minutes[i],
      favourites: pickFavourites(artist.id, tracks),
    }));
  }, [artists, tracks, range, hoursPerDay]);

  return (
    <main className="top-artists">
      <h1>Your top artists</h1>

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
        Spotify only shares rankings, not minutes. Listening times are estimates
        based on your rank and the hours per day above.
      </p>

      {loading && <p>Loading your artists…</p>}
      {error && <p role="alert">Couldn’t load your data: {error}</p>}

      <ol className="artist-list">
        {rows.map(({ artist, minutes, favourites }) => (
          <li key={artist.id} className="artist-row">
            <div className="artist-head">
              {artist.images[0] && (
                <img
                  src={artist.images[artist.images.length - 1].url}
                  alt=""
                  width={64}
                  height={64}
                />
              )}
              <div>
                <h2>{artist.name}</h2>
                <p>{formatMinutes(minutes)} listened</p>
              </div>
            </div>

            {favourites ? (
              <dl className="artist-favourites">
                <div>
                  <dt>Most listened album</dt>
                  <dd>{favourites.album.name}</dd>
                </div>
                <div>
                  <dt>Most listened song</dt>
                  <dd>{favourites.song.name}</dd>
                </div>
              </dl>
            ) : (
              <p className="note">
                None of this artist’s songs are in your top 99 tracks for this
                period.
              </p>
            )}
          </li>
        ))}
      </ol>
    </main>
  );
}
