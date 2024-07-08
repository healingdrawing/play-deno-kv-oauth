import { loadSync, kvdb, Data } from "../../deps.ts";
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