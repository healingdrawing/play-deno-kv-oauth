import {
  Hono, Tokens, kvdb, getSessionId, eta,
  providers, fetch_profile_data,
  is_admin,
  get_all_data_records,
  throw_error,
} from "../../deps.ts"

const app = new Hono()

app.get("/",
  async (c) => {
    const session_id = await getSessionId(c.req.raw).then(entry => entry);
    if (session_id === undefined || session_id === "") {
      console.log("ERROR: admin.ts -> get / -> session_id", session_id)
      return throw_error(401, "incorrect session")
    }

    const provider = await kvdb.get<string>(["oauth2-providers", session_id]).then(entry => entry.value)
    if (provider === null || !providers.includes(provider)){
      console.log("ERROR: admin.ts -> get / -> provider", provider)
      return throw_error(511, "incorrect provider")
    }

    const tokens = await kvdb.get<Tokens>(["tokens", session_id]).then(entry => entry.value)
    if (tokens === null){
      console.log("ERROR: admin.ts -> get / -> tokens", tokens)
      return throw_error(511, "incorrect tokens")
    }
    
    const data = await fetch_profile_data(tokens.accessToken, session_id, provider)
    if (data === null) {
      console.log("ERROR: admin.ts -> get / -> fetch profile data from", provider)
      return throw_error(502, "incorrect response from oauth api")
    }
    
    const admin = is_admin(data.id)
    if (!admin) {
      console.log("ERROR: admin.ts -> get / -> attempt to access admin panel without permission", provider)
      return throw_error(403, "admin access required")
    }
    
    const records = await get_all_data_records()

    try{
      return c.html(
        await eta.renderAsync("admin", {data, admin, records})
      )
    } catch(e){
      console.log("ERROR: admin.ts -> get / -> renderAsync admin", e.toString())
      return throw_error(500, "admin template damaged")
    }

  }
)

export default app
