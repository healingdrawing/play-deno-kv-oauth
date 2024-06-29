
import { Hono, Tokens, kvdb, getSessionId, eta,
  Google_Profile_Data, fetch_google_profile_data,
  X_Profile_Data, fetch_x_profile_data,
} from "../../deps.ts"

/** at the moment for both google and x */
const app = new Hono()

app.get("/",
  async (c) => {
    const session_id = await getSessionId(c.req.raw).then(entry => entry as string | undefined);
    if (session_id === undefined || session_id === "") {
      console.log("ERROR: session_id ", session_id)
      return c.html( await eta.renderAsync("index", {}) )
    }

    const provider = await kvdb.get(["oauth2-providers", session_id]).then(entry => entry.value as string | undefined)
    if (provider === undefined || !["google","x"].includes(provider)){
      console.log("ERROR: provider ", provider)
      return c.html( await eta.renderAsync("error", {}) )
    }

    const tokens = await kvdb.get<Tokens>(["tokens", session_id]).then(entry => entry.value as Tokens | undefined)
    if (tokens === undefined){
      console.log("ERROR: tokens ", tokens)
      return c.html( await eta.renderAsync("error", {}) )
    }
    
    let data:Google_Profile_Data | X_Profile_Data | undefined

    if (provider === "google"){
      data = await fetch_google_profile_data(tokens.accessToken, session_id)
    } else if (provider === "x") {
      data = await fetch_x_profile_data(tokens.accessToken)
    }
    if (data === undefined) {
      console.log("ERROR: fetch data from", provider)
      return c.html( await eta.renderAsync("error", {}) )
    }
    
    return c.html(
      await eta.renderAsync("profile", data)
    );
  }
)

export default app