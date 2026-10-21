import { ACC_ENDPOINT, CLIENT_ID, REDIRECT_URI } from "./redirectToAuth";

export async function getAccessToken(code: string) {
  const verifier = localStorage.getItem("verifier");
  console.log("Verifier", verifier);

  const params = new URLSearchParams();
  params.append("client_id", CLIENT_ID);
  params.append("grant_type", "authorization_code");
  params.append("code", code);
  params.append("redirect_uri", REDIRECT_URI);
  params.append("code_verifier", verifier!);

  const result = await fetch(`${ACC_ENDPOINT}/api/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params,
  });

  const { access_token } = await result.json();
  return access_token as string;
}
