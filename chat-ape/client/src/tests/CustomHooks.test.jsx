import { renderHook, act } from "@testing-library/react"
import { it,  expect  } from "vitest"
import useInterceptor from "../Components/hooks/useInterceptors"
import { isAuth } from "../Components/Context/authContext"
import useLocalStorage from "../Components/hooks/useLocalStorage"
import { regexCheck } from "../Components/functions/passwordRegex"

it("tests the useInterceptors hook", async ()=>{
    const { result } = renderHook( ()=>useInterceptor, {
        wrapper : ({ children })=>{
            return <isAuth.Provider value={{ 
                isAuthenticated : {
                    accessToken : "accessToken",
                    refreshToken : "refreshToken"
            }}}>
                {children}
            </isAuth.Provider>
        }
    })

    const axiosInstance = result.current
    expect(axiosInstance).toBeDefined()
})

it("tests the useLocalStorage hook", async ()=>{
    const { result } = renderHook(useLocalStorage)

    expect(result.current.value).toBeNull()
    
    act(()=>result.current.setItem("random", { test : "test"}))
    act(()=> result.current.getItem("random"))

    expect(result.current.value).toHaveProperty("test", "test")
})

it("test the passwordRegex function", ()=>{
    const result = regexCheck("hello")

    expect(result).toBeFalsy()

    const result_1 = regexCheck("Greek.Myth1122")

    expect(result_1).toBe(true)
})