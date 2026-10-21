// Const
export const CLIENT_ID = "490d03cd862842c388a9374a5ea66737";
export const REDIRECT_URI = "http://127.0.0.1:5173/hello";
export const ACC_ENDPOINT = "https://accounts.spotify.com";
export const API_ENDPOINT = "https://api.spotify.com";

export async function redirectToAuthCodeFlow() {
  const verifier = generateCodeVerifier(128);
  const challenge = await generateCodeChallenge(verifier);
  localStorage.setItem("verifier", verifier);

  const params = new URLSearchParams([
    ["client_id", CLIENT_ID],
    ["response_type", "code"],
    ["redirect_uri", REDIRECT_URI],
    ["scope", "user-read-private user-read-email user-top-read"],
    ["code_challenge_method", "S256"],
    ["code_challenge", challenge],
  ]);

  const link = `${ACC_ENDPOINT}/authorize?${params.toString()}`;
  console.log("Redirecting to:", link);
  document.location = link;
  // TODO: change to <Navigate> inside <Homepage>
}

function generateCodeVerifier(length: number) {
  let text = "";
  let possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

async function generateCodeChallenge(codeVerifier: string) {
  const data = new TextEncoder().encode(codeVerifier);
  const digest = await window.crypto.subtle.digest("SHA-256", data);
  return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}
