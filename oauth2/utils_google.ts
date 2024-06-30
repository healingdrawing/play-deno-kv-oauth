import { createGoogleOAuthConfig } from "https://deno.land/x/deno_kv_oauth@v0.10.0/mod.ts"

import { loadSync, z, kvdb } from "../deps.ts"
loadSync({ export: true })

export const google_oauth_config = createGoogleOAuthConfig({
  redirectUri: "http://localhost:8000/callback-google",
  scope: "https://www.googleapis.com/auth/userinfo.profile"
})

export interface Google_Profile_Data {
  id: string;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
}

const google_schema = z.object(
  {
    id: z.string(),
    name: z.string(),
    given_name: z.string(),
    family_name: z.string(),
    picture: z.string(),
  }
)

const google_fail_case:Google_Profile_Data = {
  id: "N/A",
  name: "N/A",
  given_name: "N/A",
  family_name: "N/A",
  picture: "N/A",
}

/** fetch data from kvdb or from google api + clean old.
 * So, every new device session initiates clean the old data.
 * Refresh works from kvdb*/
export async function fetch_google_profile_data(access_token: string, session_id: string): Promise<Google_Profile_Data> {
  
  const profile = await kvdb.get<Google_Profile_Data>(["profile", "google", session_id]).then(d => d.value)
  if (profile !== null){ return profile }

  const url = "https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=" + access_token
  
  try {
    const response = await fetch(url, { method: "GET" })
    const data_json = await response.json()
    const data = await google_schema.parseAsync(data_json)

    const profiles = kvdb.list<Google_Profile_Data>({prefix: ["profile", "google"]})
    for await (const x of profiles ){ if (x.value.id === data.id) kvdb.delete(x.key) }
    
    await kvdb.set(["profile", "google", session_id], data)

    return data
  } catch (e) {
    console.log("ERROR: fetch_google_profile_data | ", e)
  }
  return google_fail_case;  
}
