import { createTwitterOAuthConfig } from "https://deno.land/x/deno_kv_oauth@v0.10.0/mod.ts";

import { loadSync } from "../deps.ts";
loadSync({ export: true });

export const x_oauth_config = createTwitterOAuthConfig({
  redirectUri: "http://localhost:8000/callback_x",
  scope: "users.read"
});

export interface X_Profile_Data {
  
}

// consider to return specific type/interface etc later
export async function fetch_x_profile_data(accessToken: string): Promise<string> {
  const url = "https://api.twitter.com/2/users/me?alt=json&access_token=" + accessToken;
  const response = await fetch(url, { method: "GET" });
  const data = await response.json();
  console.log("data inside x fetch", data);
  return data? data : undefined;
}