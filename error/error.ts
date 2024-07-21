import { HTTPException } from "https://deno.land/x/hono@v4.3.11/mod.ts";
import { ErrorHandler } from "https://deno.land/x/hono@v4.3.11/mod.ts"
import { StatusCode } from "https://deno.land/x/hono@v4.3.11/utils/http-status.ts";
import { eta } from "../deps.ts"

export const error_handler:ErrorHandler = async (err, c) => {
  console.log("===INSIDE ERROR_HANDLER===", err.toString())
  
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
export function throw_error(status_code:number, message:string){
  const code = status_code as StatusCode
  throw new HTTPException(code, { message })
}
