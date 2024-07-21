import {
  Hono, csrf, home, data, admin, export_file, import_file, manage, error_handler,
  signout,
  signin_google, callback_google,
  signin_x, callback_x,
} from "./deps.ts"

const app = new Hono()
app.use(csrf({ origin: ['http://localhost:8000', 'https://crud-deno-hono-eta-oauth.deno.dev'], }))
// app.use(csrf({ origin: (origin) => { console.log("IT IS ALIVE!",origin); return true }}))

app.route('/', home)
app.route("/data", data)
app.route("/admin", admin)
app.route("/export-file", export_file)
app.route("/import-file", import_file)
app.route("/manage", manage)

app.route("/signout", signout)

app.route("/signin-google", signin_google)
app.route("/signin-x", signin_x)

app.route("/callback-google", callback_google)
app.route("/callback-x", callback_x)

app.onError(error_handler)

Deno.serve(app.fetch)
