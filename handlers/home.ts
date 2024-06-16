
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
  
  if (!is_signed_in) {
    return c.html(
      await eta.renderAsync("index", {})
    )
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
  
  return c.html(
    await eta.renderAsync("profile", data? data : {})
  );
}