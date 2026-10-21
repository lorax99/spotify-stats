import { redirectToAuthCodeFlow } from "../auth/redirectToAuth";

export function Homepage() {
  return (
    <>
      <h1>Welcome to my landing page.</h1>
      <button onClick={() => redirectToAuthCodeFlow()}>
        Authorize at Spotify
      </button>
    </>
  );
}
