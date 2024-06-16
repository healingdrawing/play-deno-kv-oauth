/** @jsx jsx */
/** @jsxFrag  Fragment */
import { Hono, Context } from "https://deno.land/x/hono@v4.3.11/mod.ts";
import { Eta } from "https://deno.land/x/eta@v3.4.0/src/index.ts";

import { type RedirectStatusCode } from "https://deno.land/x/hono@v4.3.11/utils/http-status.ts";
import {
    createGoogleOAuthConfig,  
    getSessionId,
    handleCallback,
    signIn,
    signOut,
} from "https://deno.land/x/deno_kv_oauth@v0.10.0/mod.ts";

import { home_handler } from "./deps.ts";

import { loadSync } from "https://deno.land/std@0.194.0/dotenv/mod.ts";
loadSync({ export: true });

import { join } from "https://deno.land/std@0.224.0/path/mod.ts";
export const eta = new Eta({ views: join(Deno.cwd(), "templates") });
const db_path = join(Deno.cwd(), "db/kvdb/db");
console.log(db_path);
export const kvdb = await Deno.openKv(db_path);

const oauth_config = createGoogleOAuthConfig({
  redirectUri: "http://localhost:8000/callback",
  scope: "https://www.googleapis.com/auth/userinfo.profile"
});


const app = new Hono()



app.get('/', home_handler);

app.get("/signin", async (c:Context) => {
  const response = await signIn(c.req.raw, oauth_config);
  c.header("set-cookie", response.headers.get("set-cookie")!);
  return c.redirect(response.headers.get("location")!, response.status as RedirectStatusCode);
});

app.get("/callback", async (c:Context) => {
  const { response, sessionId, tokens } = await handleCallback(c.req.raw, oauth_config);
  
  await kvdb.set(["tokens",sessionId], tokens);
  
  c.header("set-cookie", response.headers.get("set-cookie")!);
  return c.redirect(response.headers.get("location")!, response.status as RedirectStatusCode);
});

app.get("/signout", async (c:Context) => {
  const session_id = await getSessionId(c.req.raw)
  .then(entry => entry as string | undefined);
  console.log("signout session_id", session_id);

  if (session_id !== undefined){
    await kvdb.delete(["tokens", session_id]);
  } else {
    console.log("signout failed");
  }


  const response = await signOut(c.req.raw);
  c.header("set-cookie", response.headers.get("set-cookie")!);
  return c.redirect(response.headers.get("location")!, response.status as RedirectStatusCode);
});

Deno.serve(app.fetch)