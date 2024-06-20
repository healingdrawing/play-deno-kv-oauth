import { createTwitterOAuthConfig } from "https://deno.land/x/deno_kv_oauth@v0.10.0/mod.ts";

import { loadSync, z } from "../deps.ts";
loadSync({ export: true });

export const x_oauth_config = createTwitterOAuthConfig({
  redirectUri: "http://localhost:8000/callback_x",
  scope: ["tweet.read", "users.read"] // in some reasons "tweet.read" is mandatory to read user name. it is weird
});

export interface X_Profile_Container{
  data: X_Profile_Data;
}

export interface X_Profile_Data {
  id: string;
  name: string;
  username: string;
};

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
);

const x_fail_case: X_Profile_Data = {  
    id: "N/A",
    name: "N/A",
    username: "N/A",  
}

// consider to return specific type/interface etc later
export async function fetch_x_profile_data(access_token: string): Promise<X_Profile_Data> {
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
  try {
    const data = await response.json();
    console.log("data inside fetch x: ", data);
    return (await x_schema.parseAsync(data)).data; //.data removes container
  } catch (e) {
    console.log("ERROR: fetch_x_profile_data | ", e);
  }
  return x_fail_case;
};
