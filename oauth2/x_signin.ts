import { signIn } from "https://deno.land/x/deno_kv_oauth@v0.10.0/mod.ts";

import { Context, RedirectStatusCode, x_oauth_config } from "../deps.ts";

export const x_signin_handler = async (c:Context) => {
  const response = await signIn(c.req.raw, x_oauth_config);
  c.header("set-cookie", response.headers.get("set-cookie")!);
  return c.redirect(response.headers.get("location")!, response.status as RedirectStatusCode);
}