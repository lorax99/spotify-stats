import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { redirectToAuthCodeFlow } from "../auth/redirectToAuthCodeFlow";

const CLIENT_ID = "490d03cd862842c388a9374a5ea66737";

export function Homepage() {
  const [code, setCode] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const code = searchParams.get("code") ?? "";
    console.log("Code", code);
    setCode(code);
  }, [searchParams]);

  useEffect(() => {
    const fetchShit = async () => {
      if (!code) {
        redirectToAuthCodeFlow(CLIENT_ID);
      } else {
        const accessToken = await getAccessToken(CLIENT_ID, code);
        const profile = await fetchProfile(accessToken);
        populateUI(profile);
      }
    };
    fetchShit();
  }, [code]);

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

async function getAccessToken(clientId: string, code: string) {
  // TODO: Get access token for code
  return "test";
}

async function fetchProfile(token: string): Promise<any> {
  // TODO: Call Web API
}

function populateUI(profile: any) {
  // TODO: Update UI with profile data
}
