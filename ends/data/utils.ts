import { Google_Profile_Data, kvdb, providers, z } from "../../deps.ts"

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

export async function get_data(provider:string, session_id:string):Promise<Data | null>{
  let data = null
  if (providers.includes(provider)){
    const profile = await kvdb.get<Google_Profile_Data>(["profile", provider, session_id]).then(d => d.value)
    if (profile === null){
      console.log(`ERROR: get ${provider} profile from kvdb`)
    } else {
      data = await kvdb.get<Data>(["data", profile.id]).then(d => d.value)
      if (data === null) {
        console.log(`ERROR: get data from kvdb using ${provider} profile id`)
      }
    }
  }
  //todo raw, not tested at all
  return data
}