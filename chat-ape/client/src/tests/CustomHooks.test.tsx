import { renderHook, act } from "@testing-library/react"
import { it,  expect  } from "vitest"
import useInterceptor from "../Components/hooks/useInterceptors"
import { isAuth } from "../Components/Context/authContext"
import useLocalStorage from "../Components/hooks/useLocalStorage"
// import { regexCheck } from "../Components/functions/passwordRegex"


