
import { Hono, kvdb, getSessionId, eta,
  data_placeholder, providers, set_data, get_data,
} from "../../deps.ts"

const app = new Hono()

app.get("/",
  async (c) => {    
    const session_id = await getSessionId(c.req.raw).then(entry => entry as string | undefined);
    if (session_id === undefined || session_id === "") {
      console.log("ERROR: session_id ", session_id)
      return c.html( await eta.renderAsync("index", {}) )
    }

    const provider = await kvdb.get<string>(["oauth2-providers", session_id]).then(entry => entry.value)
    if (provider === null || !providers.includes(provider)){
      console.log("ERROR: provider ", provider)
      return c.html( await eta.renderAsync("error", {}) )
    }

    let data = await get_data(provider, session_id)
    if (data === null){
      console.log("ERROR: data ", data, ". Use placeholder instead!")
      data = data_placeholder
    }
    
    return c.html(
      await eta.renderAsync("data", data)
    );
  }
)

app.post("/",
  async (c) => {
    const session_id = await getSessionId(c.req.raw).then(entry => entry as string | undefined);
    if (session_id === undefined || session_id === "") {
      console.log("ERROR: session_id ", session_id)
      return c.html( await eta.renderAsync("index", {}) )
    }

    const provider = await kvdb.get<string>(["oauth2-providers", session_id]).then(entry => entry.value)
    if (provider === null || !providers.includes(provider)){
      console.log("ERROR: provider ", provider)
      return c.html( await eta.renderAsync("error", {}) )
    }

    const body = await c.req.parseBody()
    console.log("body ", body)

    if (await set_data(provider, session_id, body) === false){
      return c.html( await eta.renderAsync("error", {}) )
    }

    return c.redirect("/data")
  }
)

app.get("/edit",
  async (c) => {
    const session_id = await getSessionId(c.req.raw).then(entry => entry as string | undefined);
    if (session_id === undefined || session_id === "") {
      console.log("ERROR: session_id ", session_id)
      return c.html( await eta.renderAsync("index", {}) )
    }

    const provider = await kvdb.get<string>(["oauth2-providers", session_id]).then(entry => entry.value)
    if (provider === null || !providers.includes(provider)){
      console.log("ERROR: provider ", provider)
      return c.html( await eta.renderAsync("error", {}) )
    }

    let data = await get_data(provider, session_id)
    if (data === null){
      console.log("ERROR: data ", data, ". Use placeholder instead!")
      data = data_placeholder
    }

    return c.html(
      await eta.renderAsync("edit", data)
    );
  }
)

export default app
