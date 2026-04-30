import { useContext, useEffect, useState, type SetStateAction } from "react";
import { useSearchParams } from "react-router-dom";
import { redirectToAuthCodeFlow } from "../auth/redirectToAuthCodeFlow";
import { CLIENT_ID } from "../App";

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
