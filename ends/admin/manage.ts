import {
  Hono, Tokens, kvdb, getSessionId, eta,
  providers, fetch_profile_data,
  is_admin,
  get_all_data_records,
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
    } else {
      console.log("Admin logged in") //todo remove later
    }
    
    const system_id = c.req.param('id')
    if (system_id === "" || system_id === undefined || system_id === null){
      console.log("ERROR: bad id ", system_id)
      return c.html( await eta.renderAsync("error", {}) )
    }

    console.log("system_id is", system_id) //todo implement manage record by admin using system_id. Create get_data_by_id
    //todo artefacts, refactor next, do not forget add system_id into data from kvdb
    const records = await get_all_data_records()

    return c.html(
      await eta.renderAsync("manage", {data, admin, records})
    );
  }
)

export default app
