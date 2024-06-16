
import { Hono, Context } from "https://deno.land/x/hono@v4.3.11/mod.ts";
import { Eta } from "https://deno.land/x/eta@v3.4.0/src/index.ts";

import { type RedirectStatusCode } from "https://deno.land/x/hono@v4.3.11/utils/http-status.ts";
import {
    getSessionId,
    signOut,
} from "https://deno.land/x/deno_kv_oauth@v0.10.0/mod.ts";

import { home_handler, signin_handler } from "./deps.ts";

import { join } from "https://deno.land/std@0.224.0/path/mod.ts";
import { callback_handler } from "./handlers/callback.ts";
export const eta = new Eta({ views: join(Deno.cwd(), "templates") });
// const db_path = join(Deno.cwd(), "kvdb");
// console.log(db_path);
export const kvdb = await Deno.openKv("db");

const app = new Hono()

app.get('/', home_handler);

app.get("/signin", signin_handler);

app.get("/callback", callback_handler);

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