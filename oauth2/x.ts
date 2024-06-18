import { createTwitterOAuthConfig } from "https://deno.land/x/deno_kv_oauth@v0.10.0/mod.ts";

import { loadSync } from "../deps.ts";
loadSync({ export: true });

export const x_oauth_config = createTwitterOAuthConfig({
  redirectUri: "http://localhost:8000/callback_x",
  scope: ["tweet.read", "users.read"] // in some reasons "tweet.read" is mandatory to read user name. it is weird
});

export interface X_Profile_Data {
  
}

// consider to return specific type/interface etc later
export async function fetch_x_profile_data(access_token: string): Promise<string> {
  const url = "https://api.twitter.com/2/users/me"; //?access_token=" + access_token;
  const response = await fetch(
    url,
    {
      method: "GET",
      headers: {
        'Authorization': 'Bearer ' + access_token,
        'Content-Type': 'application/json'
      }
    }
  );
  const data = await response.json();
  console.log("data inside x fetch", data);
  return data? data : undefined;
}