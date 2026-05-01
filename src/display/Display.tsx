import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { ACC_ENDPOINT, API_ENDPOINT, CLIENT_ID, REDIRECT_URI } from "../App";
import { useNavigateToHome } from "../homepage/useNavigateToHome";

export function Display() {
  const [searchParams, setSearchParams] = useSearchParams();
  const code = searchParams.get("code") ?? "";
  const { navigateToHome } = useNavigateToHome();

  useEffect(() => {
    const doShit = async () => {
      if (code) {
        const accessToken = await getAccessToken(CLIENT_ID, code, REDIRECT_URI);
        const profile = await fetchProfile(accessToken);
        console.log(profile);
        populateUI(profile);
      } else {
        navigateToHome();
      }
    };
    doShit();
  }, []);

  return (
    <>
      <h1>Display your Spotify profile data</h1>
      <section id="profile">
        <h2>
          Logged in as <span id="displayName"></span>
        </h2>
        <span id="avatar"></span>
        <ul>
          <li>
            User ID: <span id="id"></span>
          </li>
          <li>
            Email: <span id="email"></span>
          </li>
          <li>
            Spotify URI: <a id="uri" href="#"></a>
          </li>
          <li>
            Link: <a id="url" href="#"></a>
          </li>
          <li>
            Profile Image: <span id="imgUrl"></span>
          </li>
        </ul>
      </section>
    </>
  );
}

async function getAccessToken(
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

async function fetchProfile(token: string): Promise<any> {
  const result = await fetch(`${API_ENDPOINT}/v1/me`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

  return await result.json();
}

function populateUI(profile: any) {
  // TODO: Update UI with profile data
}
