import { BodyData } from "https://deno.land/x/hono@v4.3.11/utils/body.ts";
import { loadSync, kvdb, Data, data_schema, data_with_id_schema, dprint } from "../../deps.ts";
loadSync({ export: true })

function admins_list():string[] | null{
  const raw = Deno.env.get("ADMIN_IDS")
  if (raw === undefined) {return null}
  
  const admins = raw.split(",").map<string>(x => x.trim())
  if (admins.includes("")){ return null}
  console.log(dprint("ADMIN_IDS", admins.join("\n")))
  
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
  
  return records
}

/** system_id - unique id given by google or x/twitter oauth2 response */
export async function get_data_by_id( system_id:string ):Promise<Data | null>{
  let data:Data | null = null
      
  const data_raw = await kvdb.get<Data>(["data", system_id]).then(d => d.value)
  if (data_raw === null) {
    console.log(`ERROR: get data from kvdb using system id ${system_id}`)
    return null
  }

  try {
    data = await data_schema.parseAsync(data_raw)
  } catch (e) {
    console.log("ERROR: parse data from kvdb | ", e, " | system id ", system_id);
    return null
  }
  
  return data
}

export async function set_data_by_id(body:BodyData):Promise<boolean>{
  try{
    const data_with_id = await data_with_id_schema.parseAsync(body)
    const { system_id,...data } = data_with_id;
    await kvdb.set(["data", system_id], data)// it should be stable, so no separate check
  } catch (e) {
    console.log("ERROR: set_data_by_id parse data from body | ", e)
    return false
  }
    
  return true
}

export async function delete_data_by_id(system_id:string):Promise<boolean>{
  try{
    await kvdb.delete(["data", system_id]) //at the moment try looks useless, because delete return nothing
  } catch (e) {
    console.log("ERROR: delete_data_by_id | ", e)
    return false
  }
    
  return true
}
