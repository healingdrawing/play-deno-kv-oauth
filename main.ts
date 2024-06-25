import {
  Hono, home, signout,
  google_signin_handler, google_callback_handler,
  x_signin_handler, x_callback_handler 
} from "./deps.ts";


const app = new Hono()

app.route('/', home);
app.route("/signout", signout);

app.get("/signin-google", google_signin_handler);
app.get("/signin-x", x_signin_handler);

app.get("/callback-google", google_callback_handler);
app.get("/callback-x", x_callback_handler);


Deno.serve(app.fetch)
