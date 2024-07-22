import {
  Hono, Tokens, kvdb, getSessionId,
  providers, fetch_profile_data,
  is_admin,
  throw_error,
} from "../../deps.ts"
import { parse_json_string_database_into_data_array, update_denokv_database_using_data_array } from "./utils.ts";

const app = new Hono()

app.post("/",
  async (c) => {
    const session_id = await getSessionId(c.req.raw).then(entry => entry);
    if (session_id === undefined || session_id === "") {
      console.log("ERROR: import_file.ts -> post / -> session_id", session_id)
      return throw_error(401, "incorrect session")
    }

    const provider = await kvdb.get<string>(["oauth2-providers", session_id]).then(entry => entry.value)
    if (provider === null || !providers.includes(provider)){
      console.log("ERROR: import_file.ts -> post / -> provider", provider)
      return throw_error(511, "incorrect provider")
    }

    const tokens = await kvdb.get<Tokens>(["tokens", session_id]).then(entry => entry.value)
    if (tokens === null){
      console.log("ERROR: import_file.ts -> post / -> tokens", tokens)
      return throw_error(511, "incorrect tokens")
    }
    
    const data = await fetch_profile_data(tokens.accessToken, session_id, provider)
    if (data === null) {
      console.log("ERROR: import_file.ts -> post / -> fetch profile data from", provider)
      return throw_error(502, "incorrect response from oauth api")
    }
    
    const admin = is_admin(data.id)
    if (!admin) {
      console.log("ERROR: import_file.ts -> post / -> attempt to access admin panel without permission", provider)
      return throw_error(403, "admin access required")
    }
    
    const body = await c.req.formData()
    const file = body.get("file")
    
    if (file === null){
      console.log("ERROR: import_file.ts -> post / -> body.get('file') === null")
      return throw_error(400, "incorrect form data")
    }

    const json_string = await (file as File).text()

    const key_data_array = await parse_json_string_database_into_data_array(json_string)

    if (key_data_array === null){
      console.log("ERROR: import_file.ts -> post / -> key_data_array === null")
      return throw_error(400, "incorrect parse data")
    }

    await update_denokv_database_using_data_array(key_data_array)
    
    return c.redirect("/admin")
  }
)

export default app
