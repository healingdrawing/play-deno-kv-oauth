// todo not tested properly (with edge case data, empty etc).
/** debug print title and value into string with frame */
export function dprint(title:string, value:string):string{
  let s = ""
  const [w_title, h_title, tx] = get_wh_sizes(title)
  const [w_value, h_value, vx] = get_wh_sizes(value)
  const w = Math.max(w_title, w_value)
  const frame = "=".repeat(w)+"\n"

  s += frame
  for (let i = 0; i < h_title; i++){ s += center_inside(tx[i], w) + "\n" }
  s += frame
  for (let i = 0; i < h_value; i++){ s += center_inside(vx[i], w) + "\n" }
  s += frame

  return s
}

function get_wh_sizes(s:string):[number, number, string[]]{
  const sx = s.split("\n")
  const max_width = Math.max( ...sx.map(l=>l.length) )
  const high = sx.length
  return (max_width > 0)?[max_width + 4,high, sx]:[0,0,[]]
}

function center_inside(s:string, max_width:number):string{
  const left = Math.floor((max_width - 4 - s.length) / 2)
  const right = Math.ceil((max_width - 4 - s.length) / 2)
  return "= " + " ".repeat(left) + s + " ".repeat(right) + " =" || ""
}
