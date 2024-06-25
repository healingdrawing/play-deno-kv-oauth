import { Hono, home, signout_handler,
  google_signin_handler, google_callback_handler
} from "./deps.ts";


import { x_signin_handler, x_callback_handler } from "./deps.ts";

const app = new Hono()

app.route('/', home);

app.get("/signin-google", google_signin_handler);
app.get("/signin-x", x_signin_handler);

app.get("/callback-google", google_callback_handler);
app.get("/callback-x", x_callback_handler);

app.get("/signout", signout_handler);

Deno.serve(app.fetch)