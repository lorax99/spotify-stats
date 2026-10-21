import { ACC_ENDPOINT } from "../App";

export async function getAccessToken(
  clientId: string,
  code: string,
  redirect_uri: string,
) {
  const verifier = localStorage.getItem("verifier");
  console.log("Verifier", verifier);

  const params = new URLSearchParams();
  params.append("client_id", clientId);
  params.append("grant_type", "authorization_code");
  params.append("code", code);
  params.append("redirect_uri", redirect_uri);
  params.append("code_verifier", verifier!);

  const result = await fetch(`${ACC_ENDPOINT}/api/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params,
  });

  const { access_token } = await result.json();
  return access_token;
}
