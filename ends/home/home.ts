
import { Hono, Tokens, kvdb, getSessionId, eta,
  Google_Profile_Data, fetch_google_profile_data,
  X_Profile_Data, fetch_x_profile_data,
} from "../../deps.ts"

/** at the moment for both google and x */
const app = new Hono()

app.get("/",
  async (c) => {
    const session_id = await getSessionId(c.req.raw).then(entry => entry as string | undefined);
    console.log("session id ",session_id)

    const is_signed_in = session_id !== undefined; //has session id cookie
    console.log({is_signed_in})
    
    if (!is_signed_in) { return c.html( await eta.renderAsync("index", {}) ) }

    const provider = await kvdb.get(["oauth2-providers",session_id]).then(entry => entry.value as string | undefined)
    console.log("provider", provider) // google or x. wth, it looks dirty

    let data:Google_Profile_Data | X_Profile_Data | string | undefined

    const access_token = await kvdb.get<Tokens>(["tokens", session_id]).then(entry => entry.value as Tokens | undefined)
    console.log("access_token", access_token)

    if (provider === "google"){
      data = await fetch_google_profile_data(access_token?.accessToken!)
    } else if (provider === "x") {
      data = await fetch_x_profile_data(access_token?.accessToken!)
    } else {
      data = "wrong 'provider' value: " + provider; // should not happen
    }
    console.log("final data", data)
    
    return c.html(
      await eta.renderAsync("profile", data? data : {})
    );
  }
)

export default app