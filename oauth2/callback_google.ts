import {
  kvdb, Hono, RedirectStatusCode,
  handleCallback, google_oauth_config,
} from "../deps.ts";

const app = new Hono()

app.get("/", async (c) => {
    const { response, sessionId, tokens } = await handleCallback(c.req.raw, google_oauth_config);
    
    await kvdb.set(["tokens",sessionId], tokens);
    await kvdb.set(["oauth2-providers",sessionId], "google");
    
    c.header("set-cookie", response.headers.get("set-cookie")!);
    return c.redirect(response.headers.get("location")!, response.status as RedirectStatusCode);
  }
)

export default app