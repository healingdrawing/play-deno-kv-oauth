import {
  Hono, Tokens, kvdb, getSessionId, eta,
  providers, fetch_profile_data,
  is_admin,
} from "../../deps.ts"

const app = new Hono()

app.post("/",
  async (c) => {
    console.log("we are inside import_file.ts post /")

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
    
    // todo implement get data from form, check using zog, fill denokv
    const body = await c.req.formData()
    const file = body.get("file") // weird, in some reasons typescript check works not clear if you check body.get as if statement
    if (file !== null){
      console.log("file.toString=", await (file as File).text())
    }
    

    return c.redirect("/admin")
  }
)

export default app
