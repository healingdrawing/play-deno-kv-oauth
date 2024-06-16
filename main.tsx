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

import { fetch_google_profile_data, Google_Profile_Data, home_handler } from "./deps.ts";

import { jsx, memo } from 'https://deno.land/x/hono@v4.3.11/middleware.ts'
import { html } from "https://deno.land/x/hono@v4.3.11/helper/html/index.ts";
import { loadSync } from "https://deno.land/std@0.194.0/dotenv/mod.ts";
import { Tokens } from "https://deno.land/x/deno_kv_oauth@v0.10.0/deps.ts";
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

const Html = (props: { children?: string }) => html`
  <html>
    <style>
      *,
      *::before,
      *::after {
        box-sizing: border-box;
      }
      * {
        margin: 0;
      }
      body {
        line-height: 1.5;
        -webkit-font-smoothing: antialiased;

        font-family: system-ui;
        font-size: clamp(1.35rem, calc(1.2rem + 0.73vw), 1.77rem);

        background-color: rgb(246, 245, 245);
        color: rgb(15, 15, 15);

        min-height: 100vh;
        min-height: 100dvh;

        display: grid;
        grid-template-rows: auto 1fr auto;
        
        /* ch based on reading line */
        width: min(100% - 3rem, 60ch);
        margin-inline: auto;
        padding-block: 64px;
      }
      h1 {
        font-size: clamp(2.33rem, calc(1.41rem + 4.63vw), 5rem);
      }
      small {
        font-size: clamp(1.13rem, calc(1.08rem + 0.22vw), 1.25rem);
      }
    </style>
    <body>${props.children}</body>
  </html>
`;

const Footer = memo(() => {
  return (
    <footer>
      <small>&copy; Powered by <a href="https://hono.dev/">Hono</a></small>
    </footer>
  )
})

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