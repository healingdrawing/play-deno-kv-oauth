
import {
  Hono, Tokens, kvdb, getSessionId, eta,
  providers, fetch_profile_data,
  is_admin,
} from "../../deps.ts"

const app = new Hono()

app.get("/",
  async (c) => {
    const session_id = await getSessionId(c.req.raw).then(entry => entry);
    if (session_id === undefined || session_id === "") {
      console.log("WARNING: session_id ", session_id) //todo can be refactored or removed, since fires just on logout or first visit
      return c.html( await eta.renderAsync("index", {}) )
      //todo return throw_error(401, "Custom error message") use this to manage errors
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
    
    if (is_admin(data.id)) console.log("Admin logged in at", new Date().toUTCString())

    return c.html(
      await eta.renderAsync("profile", {data, admin:is_admin(data.id)})
    );
  }
)

export default app
