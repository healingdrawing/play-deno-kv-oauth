import {
  Hono, home, data,
  signout,
  signin_google, callback_google,
  signin_x, callback_x, 
  
} from "./deps.ts"


const app = new Hono()

app.route('/', home)
app.route("/data", data)

app.route("/signout", signout)

app.route("/signin-google", signin_google)
app.route("/signin-x", signin_x)

app.route("/callback-google", callback_google)
app.route("/callback-x", callback_x)


Deno.serve(app.fetch)
