import { loadSync, kvdb, Data, data_schema } from "../../deps.ts";
loadSync({ export: true })

function admins_list():string[] | null{
  const raw = Deno.env.get("ADMIN_IDS")
  if (raw === undefined) {return null}
  
  const admins = raw.split(",")
  if (admins.includes("")){ return null}
  
  return admins
}

const admins = admins_list()

export function is_admin(id:string):boolean{
  if (admins === null) return false
  return admins.includes(id)
}

export async function get_all_data_records(){
  const entries = kvdb.list({ prefix: ["data"]})
  const records: Deno.KvEntry<Data>[] = []

  for await (const e of entries){
    records.push(e as Deno.KvEntry<Data>)
  }

  console.log("The records: \n",records.toString())
  return records
}

/** system_id - unique id given by google or x/twitter oauth2 response */
export async function get_data_by_id(
  system_id:string
):Promise<Data | null>{
  let data:Data | null = null
      
  const data_raw = await kvdb.get<Data>(["data", system_id]).then(d => d.value)
  if (data_raw === null) {
    console.log(`ERROR: get data from kvdb using system id ${system_id}`)
    return null
  }

  try {
    console.log(data_raw)
    data = await data_schema.parseAsync(data_raw)
  } catch (e) {
    console.log("ERROR: parse data from kvdb | ", e, " | system id ", system_id);
    return null
  }
    
  //todo raw, not tested at all
  return data
}
