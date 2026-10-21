// src/hooks/useSpotifyTop.ts
import { useEffect, useState } from "react";
import { useNavigateToHome } from "../homepage/useNavigateToHome";
import {
  fetchTopArtists,
  fetchTopTracks,
  type SpotifyArtist,
  type SpotifyTrack,
  type TimeRange,
} from "./spotifyTop";

interface State {
  artists: SpotifyArtist[];
  tracks: SpotifyTrack[];
  loading: boolean;
  error: string | null;
}

export function useSpotifyTop(range: TimeRange, code: string): State {
  const [state, setState] = useState<State>({
    artists: [],
    tracks: [],
    loading: true,
    error: null,
  });
  const { navigateToHome } = useNavigateToHome();

  useEffect(() => {
    // No code from Spotify means we can't authenticate, so go back to the homepage.
    if (!code) {
      navigateToHome();
      return;
    }

    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));

    Promise.all([fetchTopArtists(range, code), fetchTopTracks(range, code)])
      .then(([artists, tracks]) => {
        if (!cancelled)
          setState({ artists, tracks, loading: false, error: null });
      })
      .catch((e: unknown) => {
        if (!cancelled)
          setState({
            artists: [],
            tracks: [],
            loading: false,
            error: e instanceof Error ? e.message : String(e),
          });
      });

    return () => {
      cancelled = true;
    };
  }, [range, code]);

  return state;
}
