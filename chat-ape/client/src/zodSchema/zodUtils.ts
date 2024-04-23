import { z } from "zod";

const zodString = z.string()
const zodStringArray = z.array(zodString)
const zodUUID = zodString.uuid()
const zodBool = z.boolean()
export {
    zodString,
    zodStringArray,
    zodBool,
    zodUUID
}