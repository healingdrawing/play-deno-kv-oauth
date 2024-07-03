import { BodyData } from "https://deno.land/x/hono@v4.3.11/utils/body.ts";
import { Google_Profile_Data, X_Profile_Data, kvdb, providers, z } from "../../deps.ts"

export interface Data {
  space_ship_name: string;
  space_ship_number: string;
  crew_name: string;
  captain_licence_number: string;
  captain_name: string;
}

export const data_schema = z.object(
  {
    space_ship_name: z.string(),
    space_ship_number: z.string(),
    crew_name: z.string(),
    captain_licence_number: z.string(),
    captain_name: z.string(),
  }
)

export const data_placeholder:Data = {
  space_ship_name: "N/A",
  space_ship_number: "N/A",
  crew_name: "N/A",
  captain_licence_number: "N/A",
  captain_name: "N/A",
}

export async function get_data(
  provider:string,
  session_id:string
):Promise<Data | null>{
  let data:Data | null = null
      
  const profile = await kvdb.get<Google_Profile_Data | X_Profile_Data>(["profile", provider, session_id]).then(d => d.value)
  if (profile === null){
    console.log(`ERROR: get ${provider} profile from kvdb`)
    return null
  }

  const data_raw = await kvdb.get<Data>(["data", profile.id]).then(d => d.value)
  if (data_raw === null) {
    console.log(`ERROR: get data from kvdb using ${provider} profile id`)
    return null
  }

  try {
    console.log(data_raw)
    data = await data_schema.parseAsync(data_raw)
  } catch (e) {
    console.log("ERROR: parse data from kvdb | ", e, " | profile id ", profile.id);
    return null
  }
    
  //todo raw, not tested at all
  return data
}

export async function set_data(
  provider: string,
  session_id: string,
  body: BodyData
):Promise<boolean>{
  const profile = await kvdb.get<Google_Profile_Data | X_Profile_Data>(["profile", provider, session_id]).then(d => d.value)
  if (profile === null){
    console.log(`ERROR: set_data get ${provider} profile from kvdb`)
    return false
  }

  let data:Data
  try{
    data = await data_schema.parseAsync(body)
    console.log("data parsed inside post", data) //todo remove
  } catch (e) {
    console.log("ERROR: parse data from body | ", e, " | session_id ", session_id);
    return false
  }

  await kvdb.set(["data", profile.id], data)
    
  return true
}
