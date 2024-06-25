import { signIn } from "https://deno.land/x/deno_kv_oauth@v0.10.0/mod.ts";

import { Hono, RedirectStatusCode, google_oauth_config } from "../deps.ts";

const app = new Hono()

app.get("/",
  async (c) => {
    const response = await signIn(c.req.raw, google_oauth_config);
    c.header("set-cookie", response.headers.get("set-cookie")!);
    return c.redirect(response.headers.get("location")!, response.status as RedirectStatusCode);
  }
)

export default app