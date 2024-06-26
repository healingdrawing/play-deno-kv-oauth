import { z } from "../../deps.ts"

export interface Data {
  space_ship_name: string;
  space_ship_number: string;
  crew_name: string;
  captain_licence_number: string;
  captain_name: string;
}

export const data_schema = z.object(
  {
    space_ship_name: z.string(),
    space_ship_number: z.string(),
    crew_name: z.string(),
    captain_licence_number: z.string(),
    captain_name: z.string(),
  }
)

export const data_placeholder:Data = {
  space_ship_name: "N/A",
  space_ship_number: "N/A",
  crew_name: "N/A",
  captain_licence_number: "N/A",
  captain_name: "N/A",
}
