import { z } from "zod"

const zodString = z.string()
const zodUrl = z.string().url()
const zodStringArray = z.array(z.string())
const zodBool = z.boolean()
export {
    zodString,
    zodUrl,
    zodStringArray,
    zodBool
}
