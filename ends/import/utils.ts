import { kvdb, data_schema_array, Key_Data } from "../../deps.ts"

export async function parse_json_string_database_into_data_array(json_string: string):Promise< Key_Data[] | null >{
  try{
    const json_object = JSON.parse(json_string)
    const parsed = await data_schema_array.parseAsync(json_object)
    return parsed
  } catch (e) {
    console.log("ERROR: parse_json_string_database_into_Data_array ->", e)
  }
  return null
}

export async function update_denokv_database_using_data_array(data_array: Key_Data[]){
  for (const key_value of data_array){
    try{
      const key = key_value.key
      const data = key_value.value
      await kvdb.set(key, data)
    } catch (e) {
      console.log("ERROR: update kvdb using data_array ->", e)
    }
  }
}
