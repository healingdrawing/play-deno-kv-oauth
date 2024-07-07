import { loadSync } from "../../deps.ts";
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
