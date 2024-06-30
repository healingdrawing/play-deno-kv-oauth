import { createTwitterOAuthConfig } from "https://deno.land/x/deno_kv_oauth@v0.10.0/mod.ts"

import { kvdb, loadSync, z } from "../deps.ts"
loadSync({ export: true })

export const x_oauth_config = createTwitterOAuthConfig({
  redirectUri: "http://localhost:8000/callback-x",
  scope: ["tweet.read", "users.read"] // in some reasons "tweet.read" is mandatory to read user name. it is weird
})

export interface X_Profile_Container{
  data: X_Profile_Data;
}

export interface X_Profile_Data {
  id: string;
  name: string;
  username: string;
}

const x_schema = z.object(
  {
    data: z.object(
      {
        id: z.string(),
        name: z.string(),
        username: z.string(),
      }
    ),
  }
)

const x_fail_case: X_Profile_Data = {  
    id: "N/A",
    name: "N/A",
    username: "N/A",  
}

/** fetch data from kvdb or from x/twitter api + clean old.
 * So, every new device session initiates clean the old data.
 * Refresh works from kvdb*/
export async function fetch_x_profile_data(access_token: string, session_id: string): Promise<X_Profile_Data> {

  const profile = await kvdb.get<X_Profile_Data>(["profile", "x", session_id]).then(d => d.value)
  if (profile !== null){ return profile }

  const url = "https://api.twitter.com/2/users/me"
  try {
    const response = await fetch(
      url,
      {
        method: "GET",
        headers: {
          'Authorization': 'Bearer ' + access_token,
          'Content-Type': 'application/json'
        }
      }
    )
    const data_json = await response.json()
    const x_data_container:X_Profile_Container = await x_schema.parseAsync(data_json)
    const data = x_data_container.data

    const profiles = kvdb.list<X_Profile_Data>({prefix: ["profile", "x"]})
    for await (const x of profiles){ if (x.value.id === data.id) kvdb.delete(x.key) }

    await kvdb.set(["profile", "x", session_id], data)

    return data
  } catch (e) {
    console.log("ERROR: fetch_x_profile_data | ", e)
  }
  return x_fail_case;
}
