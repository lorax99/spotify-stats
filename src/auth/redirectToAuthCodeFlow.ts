const REDIRECT_URI = "http://127.0.0.1:5173/hello";
const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
const RESPONSE_TYPE = "code";

export async function redirectToAuthCodeFlow(clientId: string) {
  const verifier = generateCodeVerifier(128);
  const challenge = await generateCodeChallenge(verifier);
  localStorage.setItem("verifier", verifier);

  const params = new URLSearchParams([
    ["client_id", clientId],
    ["response_type", RESPONSE_TYPE],
    ["redirect_uri", REDIRECT_URI],
    ["scope", "user-read-private user-read-email"],
    ["code_challenge_method", "S256"],
    ["code_challenge", challenge],
  ]);

  const link = `${AUTH_ENDPOINT}?${params.toString()}`;
  console.log("Redirecting to:", link);
  document.location = `${AUTH_ENDPOINT}?${params.toString()}`;
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
