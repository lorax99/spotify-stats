import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { API_ENDPOINT } from "../auth/redirectToAuth";
import { useNavigateToHome } from "../homepage/useNavigateToHome";
import { getAccessToken } from "../auth/getAccessToken";

export function Display() {
  const [searchParams] = useSearchParams();
  const code = searchParams.get("code") ?? "";
  const { navigateToHome } = useNavigateToHome();

  useEffect(() => {
    const doShit = async () => {
      if (code) {
        const accessToken = await getAccessToken(code);
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

async function fetchProfile(token: string): Promise<any> {
  const result = await fetch(`${API_ENDPOINT}/v1/me`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

  return await result.json();
}

function populateUI(profile: any) {
  document.getElementById("displayName")!.innerText = profile.display_name;
  if (profile.images[0]) {
    const profileImage = new Image(200, 200);
    profileImage.src = profile.images[0].url;
    document.getElementById("avatar")!.appendChild(profileImage);
  }
  document.getElementById("id")!.innerText = profile.id;
  document.getElementById("email")!.innerText = profile.email;
  document.getElementById("uri")!.innerText = profile.uri;
  document
    .getElementById("uri")!
    .setAttribute("href", profile.external_urls.spotify);
  document.getElementById("url")!.innerText = profile.href;
  document.getElementById("url")!.setAttribute("href", profile.href);
  document.getElementById("imgUrl")!.innerText =
    profile.images[0]?.url ?? "(no profile image)";
}
