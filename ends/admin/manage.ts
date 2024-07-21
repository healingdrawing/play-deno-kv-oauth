import {
  Hono, Tokens, kvdb, getSessionId, eta,
  providers, fetch_profile_data,
  is_admin, get_data_by_id, set_data_by_id, delete_data_by_id,
  throw_error,
} from "../../deps.ts"

const app = new Hono()


app.get("/:id",
  async (c) => {
    const session_id = await getSessionId(c.req.raw).then(entry => entry);
    if (session_id === undefined || session_id === "") {
      console.log("ERROR: session_id ", session_id)
      return throw_error(401, "incorrect session")
    }

    const provider = await kvdb.get<string>(["oauth2-providers", session_id]).then(entry => entry.value)
    if (provider === null || !providers.includes(provider)){
      console.log("ERROR: get provider ", provider)
      return throw_error(511, "incorrect provider")
    }

    const tokens = await kvdb.get<Tokens>(["tokens", session_id]).then(entry => entry.value)
    if (tokens === null){
      console.log("ERROR: get tokens ", tokens)
      return throw_error(511, "incorrect tokens")
    }
    
    const data = await fetch_profile_data(tokens.accessToken, session_id, provider)
    if (data === null) {
      console.log("ERROR: fetch profile data from", provider)
      return throw_error(502, "incorrect response from oauth api")
    }
    
    const admin = is_admin(data.id)
    if (!admin) {
      console.log("ERROR: attempt to access admin panel without permission", provider)
      return throw_error(403, "admin access required")
    }
    
    const system_id = c.req.param("id")
    if (system_id === "" || system_id === undefined || system_id === null){
      console.log("ERROR: bad id ", system_id)
      return throw_error(400, "incorrect parameter")
    }
    
    const record = await get_data_by_id(system_id)
    if (record === null){
      return throw_error(500, "record === null")
    }

    try{
      return c.html(
        await eta.renderAsync("manage", {data, admin, record, system_id})
      );
    } catch(e){
      console.log(e.toString())
      return throw_error(500, "manage template damaged")
    }

  }
)


app.post("/",
  async (c) => {
    const session_id = await getSessionId(c.req.raw).then(entry => entry);
    if (session_id === undefined || session_id === "") {
      console.log("ERROR: session_id ", session_id)
      return throw_error(401, "incorrect session")
    }

    const provider = await kvdb.get<string>(["oauth2-providers", session_id]).then(entry => entry.value)
    if (provider === null || !providers.includes(provider)){
      console.log("ERROR: get provider ", provider)
      return throw_error(511, "incorrect provider")
    }

    const tokens = await kvdb.get<Tokens>(["tokens", session_id]).then(entry => entry.value)
    if (tokens === null){
      console.log("ERROR: get tokens ", tokens)
      return throw_error(511, "incorrect tokens")
    }
    
    const data = await fetch_profile_data(tokens.accessToken, session_id, provider)
    if (data === null) {
      console.log("ERROR: fetch profile data from", provider)
      return throw_error(502, "incorrect response from oauth api")
    }
    
    const admin = is_admin(data.id)
    if (!admin) {
      console.log("ERROR: attempt to access admin panel without permission", provider)
      return throw_error(403, "admin access required")
    }

    const body = await c.req.parseBody()
    
    if (await set_data_by_id(body) === false){
      return throw_error(400, "incorrect form data")
    }

    return c.redirect("/admin");
  }
)


/** Actually it is "delete", because "delete" and "put" still dead for html forms, facepalm */
app.post("/:id", 
  async (c) => {
    const session_id = await getSessionId(c.req.raw).then(entry => entry);
    if (session_id === undefined || session_id === "") {
      console.log("ERROR: session_id ", session_id)
      return throw_error(401, "incorrect session")
    }

    const provider = await kvdb.get<string>(["oauth2-providers", session_id]).then(entry => entry.value)
    if (provider === null || !providers.includes(provider)){
      console.log("ERROR: get provider ", provider)
      return throw_error(511, "incorrect provider")
    }

    const tokens = await kvdb.get<Tokens>(["tokens", session_id]).then(entry => entry.value)
    if (tokens === null){
      console.log("ERROR: get tokens ", tokens)
      return throw_error(511, "incorrect tokens")
    }
    
    const data = await fetch_profile_data(tokens.accessToken, session_id, provider)
    if (data === null) {
      console.log("ERROR: fetch profile data from", provider)
      return throw_error(502, "incorrect response from oauth api")
    }
    
    const admin = is_admin(data.id)
    if (!admin) {
      console.log("ERROR: attempt to access admin panel without permission", provider)
      return throw_error(403, "admin access required")
    }

    const system_id = c.req.param("id").trim()
    if (system_id.length === 0){
      console.log("WARNING: Attempt to delete record. Empty system id detected!")
      return throw_error(400, "incorrect parameter")
    }
    
    if (await delete_data_by_id(system_id) === false){
      return throw_error(500, `failed to delete record with id: ${system_id}`)
    }

    return c.redirect("/admin");
  }
)

export default app
