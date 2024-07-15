import {
  Hono, Tokens, kvdb, getSessionId, eta,
  providers, fetch_profile_data,
  is_admin,
} from "../../deps.ts"
import { parse_json_string_database_into_data_array, update_denokv_database_using_data_array } from "./utils.ts";

const app = new Hono()

app.post("/",
  async (c) => {
    const session_id = await getSessionId(c.req.raw).then(entry => entry);
    if (session_id === undefined || session_id === "") {
      console.log("ERROR: session_id ", session_id)
      return c.html( await eta.renderAsync("index", {}) )
    }

    const provider = await kvdb.get<string>(["oauth2-providers", session_id]).then(entry => entry.value)
    if (provider === null || !providers.includes(provider)){
      console.log("ERROR: get provider ", provider)
      return c.html( await eta.renderAsync("error", {}) )
    }

    const tokens = await kvdb.get<Tokens>(["tokens", session_id]).then(entry => entry.value)
    if (tokens === null){
      console.log("ERROR: get tokens ", tokens)
      return c.html( await eta.renderAsync("error", {}) )
    }
    
    const data = await fetch_profile_data(tokens.accessToken, session_id, provider)
    if (data === null) {
      console.log("ERROR: fetch profile data from", provider)
      return c.html( await eta.renderAsync("error", {}) )
    }
    
    const admin = is_admin(data.id)
    if (!admin) {
      console.log("ERROR: attempt to access admin panel without permission", provider)
      return c.html( await eta.renderAsync("error", {}) )
    }
    
    const body = await c.req.formData()
    const file = body.get("file")
    
    if (file === null){
      console.log("ERROR: import_file.ts -> body.get('file') === null")
      return c.html( await eta.renderAsync("error", {}) )
    }

    const json_string = await (file as File).text()
    console.log("(=== json_string", json_string)

    const key_data_array = await parse_json_string_database_into_data_array(json_string)

    if (key_data_array === null){
      console.log("ERROR: import_file.ts -> key_data_array === null")
      return c.html( await eta.renderAsync("error", {}))
    }

    await update_denokv_database_using_data_array(key_data_array)
    
    return c.redirect("/admin")
  }
)

export default app
