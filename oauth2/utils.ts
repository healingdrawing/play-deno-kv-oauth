import { Google_Profile_Data, X_Profile_Data, fetch_google_profile_data, fetch_x_profile_data } from "../deps.ts";

export interface Profile_Data{
  id: string
  info: string
}

export async function fetch_profile_data(
  access_token: string,
  session_id: string,
  provider:string
):Promise<Profile_Data | null>{
  let data:Google_Profile_Data | X_Profile_Data | undefined

  if (provider === "google"){
    data = await fetch_google_profile_data(access_token, session_id)
  } else if (provider === "x") {
    data = await fetch_x_profile_data(access_token, session_id)
  }

  if (data !== undefined){ return {id:data.id, info:data.name} }

  return null
}