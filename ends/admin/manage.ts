import {
  Hono, Tokens, kvdb, getSessionId, eta,
  providers, fetch_profile_data,
  is_admin, get_data_by_id, set_data_by_id,
} from "../../deps.ts"

const app = new Hono()

app.get("/:id",
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
    
    const system_id = c.req.param('id')
    if (system_id === "" || system_id === undefined || system_id === null){
      console.log("ERROR: bad id ", system_id)
      return c.html( await eta.renderAsync("error", {}) )
    }
    
    const record = await get_data_by_id(system_id)

    return c.html(
      await eta.renderAsync("manage", {data, admin, record, system_id})
    );
  }
)


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

    const body = await c.req.parseBody()
    
    if (await set_data_by_id(body) === false){
      return c.html( await eta.renderAsync("error", {}) )
    }

    return c.redirect("/admin");
  }
)


export default app
