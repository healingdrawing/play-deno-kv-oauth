import { HTTPException } from "https://deno.land/x/hono@v4.3.11/mod.ts";
import {
  Hono, csrf, bodyLimit, home, data, admin, export_file, import_file, manage, error_handler,
  signout,
  signin_google, callback_google,
  signin_x, callback_x,
  throw_error,
  eta,
  custom_http_exception,
} from "./deps.ts"

const app = new Hono()
app.use(csrf({ origin: ['http://localhost:8000', 'https://crud-deno-hono-eta-oauth.deno.dev'], }))
// app.use(csrf({ origin: (origin) => { console.log("IT IS ALIVE!",origin); return true }}))

app.use(bodyLimit({maxSize: 10*1024, onError: async (c) => {
  return await error_handler(custom_http_exception(413), c)
},})) //10kb max for request body

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
