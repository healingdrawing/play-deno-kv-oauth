export { join } from "https://deno.land/std@0.224.0/path/mod.ts";

import { join } from "https://deno.land/std@0.224.0/path/mod.ts";
import { Eta } from "https://deno.land/x/eta@v3.4.0/src/index.ts";
export const eta = new Eta({ views: join(Deno.cwd(), "templates") });

// const db_path = join(Deno.cwd(), "kvdb");
// console.log(db_path);
export const kvdb = await Deno.openKv("db");

export { Hono } from "https://deno.land/x/hono@v4.3.11/mod.ts";


export { loadSync } from "https://deno.land/std@0.194.0/dotenv/mod.ts";

export { z } from "https://deno.land/x/zod@v3.23.8/mod.ts";

export {
  google_oauth_config,
  fetch_google_profile_data,
  type Google_Profile_Data,
} from "./oauth2/google.ts";

export {
  x_oauth_config,
  fetch_x_profile_data,
  type X_Profile_Data,
} from "./oauth2/x.ts"

export { type Context } from "https://deno.land/x/hono@v4.3.11/mod.ts";

export { type RedirectStatusCode } from "https://deno.land/x/hono@v4.3.11/utils/http-status.ts";

export {
  getSessionId,
  handleCallback,
} from "https://deno.land/x/deno_kv_oauth@v0.10.0/mod.ts";

export { type Tokens } from "https://deno.land/x/deno_kv_oauth@v0.10.0/deps.ts";

// import home from "./ends/home/home.ts";
export { default as home } from "./ends/home/home.ts"
export { default as signout } from "./oauth2/all_signout.ts"

export { google_signin_handler } from "./oauth2/google_signin.ts";
export { x_signin_handler } from "./oauth2/x_signin.ts";

export { google_callback_handler } from "./oauth2/google_callback.ts";
export { x_callback_handler } from "./oauth2/x_callback.ts";

