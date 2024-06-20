
import { Hono } from "https://deno.land/x/hono@v4.3.11/mod.ts";
import { Eta } from "https://deno.land/x/eta@v3.4.0/src/index.ts";

import { home_handler, google_signout_handler,
  google_signin_handler, google_callback_handler
} from "./deps.ts";

import { join } from "https://deno.land/std@0.224.0/path/mod.ts";

import { x_signin_handler, x_callback_handler } from "./deps.ts";
export const eta = new Eta({ views: join(Deno.cwd(), "templates") });
// const db_path = join(Deno.cwd(), "kvdb");
// console.log(db_path);
export const kvdb = await Deno.openKv("db");

const app = new Hono()

app.get('/', home_handler);

app.get("/signin-google", google_signin_handler);
app.get("/signin-x", x_signin_handler);

app.get("/callback-google", google_callback_handler);
app.get("/callback-x", x_callback_handler);

app.get("/signout", google_signout_handler);

Deno.serve(app.fetch)