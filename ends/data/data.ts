
import { Hono, kvdb, getSessionId, eta,
  Data, data_placeholder, data_schema
} from "../../deps.ts"

/** at the moment for both google and x */
const app = new Hono()

app.get("/",
  async (c) => {
    const session_id = await getSessionId(c.req.raw).then(entry => entry as string | undefined);
    console.log(session_id)

    const is_signed_in = session_id !== undefined; //has session id cookie
    console.log({is_signed_in})
    
    if (!is_signed_in) { return c.html( await eta.renderAsync("index", {}) ) }

    const provider = await kvdb.get(["oauth2-providers",session_id]).then(entry => entry.value as string | undefined)
    console.log("provider", provider) // google or x. wth, it looks dirty

    const data_json = await kvdb.get(["data", session_id]).then(entry => entry.value as string | undefined)
    let data:Data = data_placeholder
    try {
      data = await data_schema.parseAsync(data_json)
    } catch (e) {
      console.log("ERROR: parse data from kvdb | ", e, " | session_id ", session_id);
    }
    
    return c.html(
      await eta.renderAsync("data", data? data : {})
    );
  }
)

export default app
