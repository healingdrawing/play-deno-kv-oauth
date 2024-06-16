import { signIn } from "https://deno.land/x/deno_kv_oauth@v0.10.0/mod.ts";
import { RedirectStatusCode } from "https://deno.land/x/hono@v4.3.11/utils/http-status.ts";
import { Context, google_oauth_config } from "../deps.ts";

export const signin_handler = async (c:Context) => {
  const response = await signIn(c.req.raw, google_oauth_config);
  c.header("set-cookie", response.headers.get("set-cookie")!);
  return c.redirect(response.headers.get("location")!, response.status as RedirectStatusCode);
}