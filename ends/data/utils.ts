import { BodyData } from "https://deno.land/x/hono@v4.3.11/utils/body.ts";
import { Google_Profile_Data, X_Profile_Data, kvdb, z } from "../../deps.ts"

export interface Data {
  space_ship_name: string
  space_ship_number: string
  crew_name: string
  captain_licence_number: string
  captain_name: string
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

/** to use as type of function return. import/utils.ts */
export interface Key_Data{
  key: string[]
  value: Data
}

/** for import database from json file
 * 
 *  Declaration should be here in same file as data_schema declared. In case of import data_schema outside in time of declaration of data_schema_array, error raisen. "can not use data_schema(.shape) until declare"
 */
export const data_schema_array = z.array(
  z.object({
    key: z.array(z.string()),
    value: z.object(data_schema.shape), // .shape to avoid hardcoding
    versionstamp: z.unknown(),
  }).omit({versionstamp: true}).transform((data) => ({ key: data.key, value: data.value }))
);

export const data_with_id_schema = data_schema.extend({ system_id: z.string(), });// for case of admin edit the record

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

  try{
    const data = await data_schema.parseAsync(body)
    await kvdb.set(["data", profile.id], data)// it should be stable, so no separate check
  } catch (e) {
    console.log("ERROR: parse data from body | ", e, " | session_id ", session_id);
    return false
  }
    
  return true
}
