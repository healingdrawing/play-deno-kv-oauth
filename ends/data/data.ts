
import { Hono, kvdb, getSessionId, eta,
  data_placeholder, providers, set_data, get_data, data_form_limits,
  throw_error
} from "../../deps.ts"

const app = new Hono()

app.get("/",
  async (c) => {    
    const session_id = await getSessionId(c.req.raw).then(entry => entry as string | undefined);
    if (session_id === undefined || session_id === "") {
      console.log("ERROR: data.ts -> get / -> session_id", session_id)
      return throw_error(401, "incorrect session")
    }

    const provider = await kvdb.get<string>(["oauth2-providers", session_id]).then(entry => entry.value)
    if (provider === null || !providers.includes(provider)){
      console.log("ERROR: data.ts -> get / -> provider", provider)
      return throw_error(511, "incorrect provider")
    }

    let data = await get_data(provider, session_id)
    if (data === null){
      console.log("ERROR: data ", data, ". Use placeholder instead!")
      data = data_placeholder
    }
    
    try{
      return c.html(
        await eta.renderAsync("data", data)
      )
    } catch(e){
      console.log("ERROR: data.ts -> get / -> renderAsync data", e.toString())
      return throw_error(500, "data template damaged")
    }
  }
)

app.post("/",
  async (c) => {
    const session_id = await getSessionId(c.req.raw).then(entry => entry as string | undefined);
    if (session_id === undefined || session_id === "") {
      console.log("ERROR: data.ts -> post / -> session_id", session_id)
      return throw_error(401, "incorrect session")
    }

    const provider = await kvdb.get<string>(["oauth2-providers", session_id]).then(entry => entry.value)
    if (provider === null || !providers.includes(provider)){
      console.log("ERROR: data.ts -> post / -> provider", provider)
      return throw_error(511, "incorrect provider")
    }

    const body = await c.req.parseBody()
    // console.log("body ", body) // todo remove later

    if (await set_data(provider, session_id, body) === false){
      console.log("ERROR:  data.ts -> post / -> set data")
      return throw_error(400, "incorrect form data")
    }

    return c.redirect("/data")
  }
)

app.get("/edit",
  async (c) => {
    const session_id = await getSessionId(c.req.raw).then(entry => entry as string | undefined);
    if (session_id === undefined || session_id === "") {
      console.log("ERROR: data.ts -> post / -> session_id", session_id)
      return throw_error(401, "incorrect session")
    }

    const provider = await kvdb.get<string>(["oauth2-providers", session_id]).then(entry => entry.value)
    if (provider === null || !providers.includes(provider)){
      console.log("ERROR: data.ts -> post / -> provider", provider)
      return throw_error(511, "incorrect provider")
    }

    let data = await get_data(provider, session_id)
    if (data === null){
      console.log("ERROR: data ", data, ". Use placeholder instead!")
      data = data_placeholder
    }

    try{
      return c.html(
        await eta.renderAsync("edit", {data, limit:data_form_limits})
      )
    } catch(e){
      console.log("ERROR: data.ts -> post / -> renderAsync edit", e.toString())
      return throw_error(500, "edit template damaged")
    }
  }
)

export default app
