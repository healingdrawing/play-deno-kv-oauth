import { createGoogleOAuthConfig } from "https://deno.land/x/deno_kv_oauth@v0.10.0/mod.ts";

import { loadSync } from "../deps.ts";
loadSync({ export: true });

export const google_oauth_config = createGoogleOAuthConfig({
  redirectUri: "http://localhost:8000/callback_google",
  scope: "https://www.googleapis.com/auth/userinfo.profile"
});

export interface Google_Profile_Data {
  id: string;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
}

// consider to return specific type/interface etc later
export async function fetch_google_profile_data(access_token: string): Promise<Google_Profile_Data> {
  const url = "https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=" + access_token;
  const response = await fetch(url, { method: "GET" });
  const data = await response.json();
  console.log("data inside fetch", data);
  return data? data : undefined;
}