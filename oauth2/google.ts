import { createGoogleOAuthConfig } from "https://deno.land/x/deno_kv_oauth@v0.10.0/mod.ts";

import { loadSync, z } from "../deps.ts";
loadSync({ export: true });

export const google_oauth_config = createGoogleOAuthConfig({
  redirectUri: "http://localhost:8000/callback-google",
  scope: "https://www.googleapis.com/auth/userinfo.profile"
});

export interface Google_Profile_Data {
  id: string;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
};

const google_schema = z.object(
  {
    id: z.string(),
    name: z.string(),
    given_name: z.string(),
    family_name: z.string(),
    picture: z.string(),
  }
);

const google_fail_case:Google_Profile_Data = {
  id: "N/A",
  name: "N/A",
  given_name: "N/A",
  family_name: "N/A",
  picture: "N/A",
}

// consider to return specific type/interface etc later
export async function fetch_google_profile_data(access_token: string): Promise<Google_Profile_Data> {
  const url = "https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=" + access_token;
  const response = await fetch(url, { method: "GET" });
  try {
    const data = await response.json();  
    console.log("data inside fetch google: ", data);
    return await google_schema.parseAsync(data);    
  } catch (e) {
    console.log("ERROR: fetch_google_profile_data | ", e);
  }
  return google_fail_case;  
}
