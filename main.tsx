/** @jsx jsx */
/** @jsxFrag  Fragment */
import { Hono } from 'https://deno.land/x/hono/mod.ts';
import { Context } from "https://deno.land/x/hono@v4.3.11/mod.ts";
import { createGoogleOAuthConfig } from "https://deno.land/x/deno_kv_oauth@v0.10.0/mod.ts";
import { OAuth2Client } from "https://deno.land/x/deno_kv_oauth@v0.10.0/deps.ts";

import { type RedirectStatusCode } from "https://deno.land/x/hono@v4.3.11/utils/http-status.ts";
import {
    createGitHubOAuth2Client,
    getSessionAccessToken,
    getSessionId,
    handleCallback,
    signIn,
    signOut,
} from "https://deno.land/x/deno_kv_oauth/mod.ts";
// import { jsx, html, memo } from 'https://deno.land/x/hono/middleware.ts'
import { jsx, memo } from 'https://deno.land/x/hono@v4.3.11/middleware.ts'
import { html } from "https://deno.land/x/hono@v4.3.11/helper/html/index.ts";
import { loadSync } from "https://deno.land/std@0.194.0/dotenv/mod.ts";
loadSync({ export: true });

const oauth_config = createGoogleOAuthConfig({
  redirectUri: "http://localhost:8000/callback",
  scope: "https://www.googleapis.com/auth/userinfo.profile"
});

const oauth_client = new OAuth2Client(oauth_config);

// const oauthClient = createGitHubOAuth2Client({
//   /* Multiple uri's for GitHub require this to be set https://docs.github.com/en/apps/creating-github-apps/registering-a-github-app/about-the-user-authorization-callback-url */
//   redirectUri: "https://hono-deno-kv-oauth.deno.dev/callback"
// });

type GitHubUser = {
    login: string;
    avatar_url: string;
    html_url: string;
}

async function getGitHubUser(accessToken: string): Promise<GitHubUser> {
    const response = await fetch("https://api.github.com/user", {
        headers: { authorization: `Bearer ${accessToken}` },
    });
    if (!response.ok) {
        await response.body?.cancel();
        throw new Error();
    }
    return (await response.json()) as GitHubUser;
}

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

app.get('/', async (c:Context) => {
  const sessionId = getSessionId(c.req.raw);
  const isSignedIn = sessionId !== undefined;
  // console.log({isSignedIn})
  const accessToken = isSignedIn
      ? await getSessionAccessToken(oauthClient, sessionId)
      : null;
  const githubUser = accessToken ? await getGitHubUser(accessToken) : null;

  if (!isSignedIn) {
    return c.html(`
      <Html>
        <header>
            <h1>Hono + Deno KV OAuth</h1>
        </header>
        <main>
          <a href="/signin">Login</a>
        </main>
        <Footer />
      </Html>
    `)
  }

  return c.html(`
    <Html>
      <header>
          <h1>Welcome, {githubUser.login} 🦖</h1>
      </header>
      <main>
        <a href="/signout">Logout</a>
      </main>
      <Footer />
    </Html>
  `)
})

app.get("/signin", async (c:Context) => {
  const response = await signIn(c.req.raw, oauthClient);
  c.header("set-cookie", response.headers.get("set-cookie")!);
  return c.redirect(response.headers.get("location")!, response.status as RedirectStatusCode);
});

app.get("/callback", async (c:Context) => {
  const { response, accessToken } = await handleCallback(c.req.raw, oauthClient);
  c.header("set-cookie", response.headers.get("set-cookie")!);
  return c.redirect(response.headers.get("location")!, response.status as RedirectStatusCode);
});

app.get("/signout", async (c:Context) => {
  const response = await signOut(c.req.raw);
  c.header("set-cookie", response.headers.get("set-cookie")!);
  return c.redirect(response.headers.get("location")!, response.status as RedirectStatusCode);
});

Deno.serve(app.fetch)