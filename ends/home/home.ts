
import {
  Hono, Tokens, kvdb, getSessionId, eta,
  providers, fetch_profile_data,
  is_admin,
  throw_error,
} from "../../deps.ts"

const app = new Hono()

app.get("/",
  async (c) => {
    const session_id = await getSessionId(c.req.raw).then(entry => entry);
    if (session_id === undefined || session_id === "") {
      console.log("WARNING: session_id", session_id) //todo can be refactored or removed, since fires just on logout or first visit
      return c.html( await eta.renderAsync("index", {}) )
    }

    const provider = await kvdb.get<string>(["oauth2-providers", session_id]).then(entry => entry.value)
    if (provider === null || !providers.includes(provider)){
      console.log("ERROR: home.ts -> get / -> provider", provider)
      return throw_error(511, "incorrect provider")
    }

    const tokens = await kvdb.get<Tokens>(["tokens", session_id]).then(entry => entry.value)
    if (tokens === null){
      console.log("ERROR: home.ts -> get / -> tokens", tokens)
      return throw_error(511, "incorrect tokens")
    }
    
    const data = await fetch_profile_data(tokens.accessToken, session_id, provider)
    if (data === null) {
      console.log("ERROR: home.ts -> get / -> fetch profile data from", provider)
      return throw_error(502, "incorrect response from oauth api")
    }
    
    if (is_admin(data.id)) console.log("Admin logged in at", new Date().toUTCString()) //todo potential place where logged user profile data print can be added, in case of production testing

    try{
      return c.html(
        await eta.renderAsync("profile", {data, admin:is_admin(data.id)})
      )
    } catch(e){
      console.log("ERROR: home.ts -> get / -> renderAsync profile", e.toString())
      return throw_error(500, "profile template damaged")
    }

  }
)

export default app
