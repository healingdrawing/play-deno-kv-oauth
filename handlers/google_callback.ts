import {
  Context,
  RedirectStatusCode,
  handleCallback,
  } from "../deps.ts";
  
  import {
  kvdb,
  google_oauth_config,
} from "../deps.ts";

export const google_callback_handler = async (c:Context) => {
  const { response, sessionId, tokens } = await handleCallback(c.req.raw, google_oauth_config);
  
  await kvdb.set(["tokens",sessionId], tokens);
  
  c.header("set-cookie", response.headers.get("set-cookie")!);
  return c.redirect(response.headers.get("location")!, response.status as RedirectStatusCode);
}