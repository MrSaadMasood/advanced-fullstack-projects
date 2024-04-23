import { renderHook, act } from "@testing-library/react"
import { it,  expect  } from "vitest"
import useInterceptor from "../Components/hooks/useInterceptors"
import { isAuth } from "../Components/Context/authContext"
import useLocalStorage from "../Components/hooks/useLocalStorage"
// import { regexCheck } from "../Components/functions/passwordRegex"

it("tests the useInterceptors hook", async ()=>{
    const { result } = renderHook( ()=>useInterceptor, {
        wrapper : ({ children })=>{
            return <isAuth.Provider value={{ 
                isAuthenticated : {
                    accessToken : "accessToken",
                    refreshToken : "refreshToken",
                    is2FactorAuthEnabled : false,
                    isGoogleUser : false
            },
                setIsAuthenticated : ()=> {}
            }}>
                {children}
            </isAuth.Provider>
        }
    })

    const axiosInstance = result.current
    expect(axiosInstance).toBeDefined()
})

// it("tests the useLocalStorage hook", async ()=>{
//     const { result } = renderHook(useLocalStorage)

//     expect(result.current.value).toBeNull()
    
//     act(()=>result.current.setItem("random", { test : "test"}))
//     act(()=> result.current.getItem("random"))

//     expect(result.current.value).toHaveProperty("test", "test")
// })
