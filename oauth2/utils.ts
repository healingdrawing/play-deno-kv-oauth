import { Google_Profile_Data, X_Profile_Data, dprint, fetch_google_profile_data, fetch_x_profile_data } from "../deps.ts";

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

/** implemented providers to oauth2 workflow. At the moment "google" and "x" */
export const providers = ["google", "x"]
/** at the moment implemented "google" and "x" through the .env file locally and environment variables on deploy */
export function provider_oauth_config_redirect_uri(provider:string):string{
  if (!providers.includes(provider)){
    throw new Error(`ERROR: incorrect oauth2 ${provider}.\nAllowed oauth2 providers: ${providers}`)
  }

  const caps_provider = provider.toUpperCase() // to follow the style of the environment variables
  
  const uri = Deno.env.get(caps_provider+"_OAUTH_CONFIG_REDIRECT_URI")
  if (uri === undefined) {
    throw new Error(`ERROR: undefined ${caps_provider}_OAUTH_CONFIG_REDIRECT_URI`)
  }

  if (URL.parse(uri) === null){
    throw new Error(`ERROR: incorrect ${caps_provider}_OAUTH_CONFIG_REDIRECT_URI`)
  }

  console.log(dprint(`${caps_provider}_OAUTH_CONFIG_REDIRECT_URI`, uri))
  
  return uri
}
