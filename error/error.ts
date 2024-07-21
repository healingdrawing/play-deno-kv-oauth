import { HTTPException } from "https://deno.land/x/hono@v4.3.11/mod.ts";
import { ErrorHandler } from "https://deno.land/x/hono@v4.3.11/mod.ts"
import { StatusCode } from "https://deno.land/x/hono@v4.3.11/utils/http-status.ts";
import { eta } from "../deps.ts"

export const error_handler:ErrorHandler = async (err, c) => {
  console.log("===INSIDE ERROR_HANDLER===", err.toString()) // todo remove later
  
  let e = err as HTTPException
  if (e.status === undefined || e.message === undefined){
    e = {status:500, message:"Internal Server Error"} as HTTPException
    return c.html(
      await eta.renderAsync("error", {code:e.status, info:e.message}),
      500
    )
  }
  
  return c.html(await eta.renderAsync("error", {code:e.status, info:e.message}),e.status)
}

/** throw an error properly to handle using app.onError() */
export function throw_error(status_code:StatusCode, message?:string){
  if (message) throw new HTTPException(status_code, { message })
  else throw new HTTPException(status_code, { message: error_message(status_code) })
}

const error_message = (status_code:StatusCode):string => {
  let r:string
  
  switch(status_code){
    case 400: r = "Bad Request"; break
    case 401: r = "Unauthorized"; break
    case 403: r = "Forbidden"; break // have no access rights
    case 404: r = "Not Found"; break
    case 413: r = "Payload Too Large"; break
    case 511: r = "Network Authentication Required"; break
    case 502: r = "Bad Gateway"; break
    case 500: r = "Internal Server Error"; break
    default: r = "Internal Server Error"
    }

  return r
}

export const custom_http_exception = (status_code:StatusCode):HTTPException => {
  return new HTTPException(status_code, {message: error_message(status_code)})
}