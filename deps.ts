export { join } from "https://deno.land/std@0.224.0/path/mod.ts"

// const db_path = join(Deno.cwd(), "kvdb")
// console.log(db_path)
export const kvdb = await Deno.openKv("db")
/** implemented providers to oauth2 workflow. At the moment "google" and "x" */
export const providers = ["google", "x"]

import { join } from "https://deno.land/std@0.224.0/path/mod.ts"
import { Eta } from "https://deno.land/x/eta@v3.4.0/src/index.ts"
export const eta = new Eta({ views: join(Deno.cwd(), "templates") })

export { Hono } from "https://deno.land/x/hono@v4.3.11/mod.ts"

export { loadSync } from "https://deno.land/std@0.194.0/dotenv/mod.ts"

export { z } from "https://deno.land/x/zod@v3.23.8/mod.ts"

export {
  google_oauth_config,
  fetch_google_profile_data,
  type Google_Profile_Data,
} from "./oauth2/utils_google.ts"

export {
  x_oauth_config,
  fetch_x_profile_data,
  type X_Profile_Data,
} from "./oauth2/utils_x.ts"

export {
  fetch_profile_data,
  type Profile_Data,
} from "./oauth2/utils.ts"

export { type Context } from "https://deno.land/x/hono@v4.3.11/mod.ts"

export { type RedirectStatusCode } from "https://deno.land/x/hono@v4.3.11/utils/http-status.ts"

export {
  getSessionId,
  handleCallback,
} from "https://deno.land/x/deno_kv_oauth@v0.10.0/mod.ts"

export { type Tokens } from "https://deno.land/x/deno_kv_oauth@v0.10.0/deps.ts"

export { default as home } from "./ends/home/home.ts"

export { type Data, data_placeholder, data_schema } from "./ends/data/utils.ts"
export { default as data } from "./ends/data/data.ts"

export { default as signout } from "./oauth2/signout.ts"
export { default as signin_google } from "./oauth2/signin_google.ts"
export { default as signin_x } from "./oauth2/signin_x.ts"

export { default as callback_google } from "./oauth2/callback_google.ts"
export { default as callback_x } from "./oauth2/callback_x.ts"
