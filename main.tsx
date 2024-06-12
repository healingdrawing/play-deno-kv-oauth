/** @jsx jsx */
/** @jsxFrag  Fragment */
import { Hono } from 'https://deno.land/x/hono/mod.ts';
import {
    createGitHubOAuth2Client,
    getSessionAccessToken,
    getSessionId,
    handleCallback,
    signIn,
    signOut,
} from "https://deno.land/x/deno_kv_oauth@v0.3.0/mod.ts";
import { jsx, html, memo } from 'https://deno.land/x/hono/middleware.ts'
import { loadSync } from "https://deno.land/std@0.194.0/dotenv/mod.ts";
loadSync({ export: true });

const oauthClient = createGitHubOAuth2Client({
  /* Multiple uri's for GitHub require this to be set https://docs.github.com/en/apps/creating-github-apps/registering-a-github-app/about-the-user-authorization-callback-url */
  redirectUri: "https://hono-deno-kv-oauth.deno.dev/callback"
});

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

app.get('/', async (c) => {
  const sessionId = getSessionId(c.req.raw);
  const isSignedIn = sessionId !== undefined;
  // console.log({isSignedIn})
  const accessToken = isSignedIn
      ? await getSessionAccessToken(oauthClient, sessionId)
      : null;
  const githubUser = accessToken ? await getGitHubUser(accessToken) : null;

  if (!isSignedIn) {
    return c.html(
      <Html>
        <header>
            <h1>Hono + Deno KV OAuth</h1>
        </header>
        <main>
          <a href="/signin">Login</a>
        </main>
        <Footer />
      </Html>
    )
  }

  return c.html(
    <Html>
      <header>
          <h1>Welcome, {githubUser.login} 🦖</h1>
      </header>
      <main>
        <a href="/signout">Logout</a>
      </main>
      <Footer />
    </Html>
  )
})

app.get("/signin", async (c) => {
  const response = await signIn(c.req.raw, oauthClient);
  c.header("set-cookie", response.headers.get("set-cookie")!);
  return c.redirect(response.headers.get("location")!, response.status);
});

app.get("/callback", async (c) => {
  const { response, accessToken } = await handleCallback(c.req.raw, oauthClient);
  c.header("set-cookie", response.headers.get("set-cookie")!);
  return c.redirect(response.headers.get("location")!, response.status);
});

app.get("/signout", async (c) => {
  const response = await signOut(c.req.raw);
  c.header("set-cookie", response.headers.get("set-cookie")!);
  return c.redirect(response.headers.get("location")!, response.status);
});

Deno.serve(app.fetch)