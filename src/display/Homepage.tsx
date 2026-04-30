import { useContext, useEffect, useState, type SetStateAction } from "react";
import { useSearchParams } from "react-router-dom";
import { redirectToAuthCodeFlow } from "../auth/redirectToAuthCodeFlow";
const CLIENT_ID = "490d03cd862842c388a9374a5ea66737";

export function Homepage() {
  useEffect(() => {
    const fetchShit = async () => {
      redirectToAuthCodeFlow(CLIENT_ID);
      // } else {
      //   const accessToken = await getAccessToken(CLIENT_ID, code);
      //   const profile = await fetchProfile(accessToken);
      //   populateUI(profile);
      // }
    };
    fetchShit();
  }, []);

  return <>Landing page</>;
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
