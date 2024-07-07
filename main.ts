import {
  Hono, csrf, home, data, admin,
  signout,
  signin_google, callback_google,
  signin_x, callback_x,  
} from "./deps.ts"


const app = new Hono()
app.use(csrf({
  origin: ['http://localhost:8000', 'development.myapp.example.com'],
}))
// app.use(csrf({ origin: (origin) => { console.log("IT IS ALIVE!",origin); return true }}))

app.route('/', home)
app.route("/data", data)
app.route("/admin", admin)

app.route("/signout", signout)

app.route("/signin-google", signin_google)
app.route("/signin-x", signin_x)

app.route("/callback-google", callback_google)
app.route("/callback-x", callback_x)


Deno.serve(app.fetch)
