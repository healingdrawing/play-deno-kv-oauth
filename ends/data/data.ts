
import { Hono, kvdb, getSessionId, eta,
  Data, data_placeholder, data_schema
} from "../../deps.ts"

/** at the moment for both google and x */
const app = new Hono()

app.get("/",
  async (c) => {
    console.log("we are inside get")
    const session_id = await getSessionId(c.req.raw).then(entry => entry as string | undefined);
    console.log(session_id)

    const is_signed_in = session_id !== undefined; //has session id cookie
    console.log({is_signed_in})
    
    if (!is_signed_in) { return c.html( await eta.renderAsync("index", {}) ) }

    const provider = await kvdb.get(["oauth2-providers",session_id]).then(entry => entry.value as string | undefined)
    console.log("provider", provider) // google or x. wth, it looks dirty

    const data_json = await kvdb.get(["data", session_id]).then(entry => entry.value) // as string | undefined)
    let data:Data = data_placeholder
    try {
      console.log(data_json) //bug it is null in some reasons after restart the server
      data = await data_schema.parseAsync(data_json)
    } catch (e) {
      console.log("ERROR: parse data from kvdb | ", e, " | session_id ", session_id);
    }
    
    return c.html(
      await eta.renderAsync("data", data? data : {})
    );
  }
)

app.post("/",
  async (c) => {
    console.log("we are inside post redirect")

    const session_id = await getSessionId(c.req.raw).then(entry => entry as string | undefined);
    const is_signed_in = session_id !== undefined; //has session id cookie
    if (!is_signed_in) { return c.html( await eta.renderAsync("index", {}) ) }

    const body = await c.req.parseBody();
    console.log("body ", body) // is ok

    let data:Data
    try{
      data = await data_schema.parseAsync(body)
      console.log("data parsed inside post", data)
    } catch (e) {
      console.log("ERROR: parse data from body | ", e, " | session_id ", session_id);
      data = data_placeholder
    }

    await kvdb.set(["data", session_id], data)

    return c.redirect("/data")
  }
)

app.get("/edit",
  async (c) => {
    console.log("we are inside /edit")

    const session_id = await getSessionId(c.req.raw).then(entry => entry as string | undefined);
    const is_signed_in = session_id !== undefined; //has session id cookie
    if (!is_signed_in) { return c.html( await eta.renderAsync("index", {}) ) }

    const raw_data = await kvdb.get(["data", session_id]).then(d => d.value)// as string | undefined)

    let data:Data
    try{
      data = await data_schema.parseAsync(raw_data)
      console.log("data parsed from kvdb inside edit", data)
    } catch (e) {
      console.log("ERROR: parse data from kvdb | ", e, " | session_id ", session_id);
      data = data_placeholder
    }

    



    return c.html(
      await eta.renderAsync("edit", data? data : {})
    );
  }
)

export default app
