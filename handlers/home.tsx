import { Tokens } from "../deps.ts";

import { kvdb } from "../deps.ts";

import { Context } from "../deps.ts";

import { getSessionId,} from "../deps.ts";

import { Google_Profile_Data, fetch_google_profile_data } from "../deps.ts";

import { eta } from "../deps.ts";

export  const home_handler = async (c:Context) => {
  const session_id = await getSessionId(c.req.raw)
  .then(entry => entry as string | undefined);
  console.log(session_id);

  const is_signed_in = session_id !== undefined; //has session id cookie
  console.log({is_signed_in})
  
  // !!! how to get google user name or login from .profile using oauth2 deno_kv_oauth library methods?

  if (!is_signed_in) {
    return c.html(`
      <Html>
        <header>
            <h1>Hono + Deno KV OAuth</h1>
        </header>
        <main>
          <a href="/signin">Login using google</a>
        </main>
        <Footer />
      </Html>
    `)
  }

  let data:Google_Profile_Data | undefined;

  if (typeof session_id !== 'string'){
    console.log("some crap with session_id . type of", typeof session_id);
  } else {
    const access_token = await kvdb.get<Tokens>(["tokens", session_id])
    .then(entry => entry.value as Tokens | undefined);
    console.log("access_token", access_token);

    data = await fetch_google_profile_data(access_token?.accessToken!)
    console.log("final data", data);
  }
  

  return c.html(`
    <Html>
      <header>
          <h1>Welcome, ${JSON.stringify(data)} 🦖</h1>
      </header>
      <main>
        <a href="/signout">Logout</a>
      </main>
      <Footer />
    </Html>
  `)
}