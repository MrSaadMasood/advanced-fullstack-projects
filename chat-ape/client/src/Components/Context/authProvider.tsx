import { ReactElement, useEffect, useState } from "react";
import useLocalStorage from "../hooks/useLocalStorage";
import { isAuth } from "./authContext";
import { NormalUserAuthSaved } from "../../Types/dataTypes";
// passing the initial values for the context and when the user logs in isAuthenticated is an object with two properties
// accessToken and RefreshToken and then these values are passed to the children and the tokens are stored in the localstorage
// which are accessed when the user visits the site again thus persisting the user login
const AuthProvider = ({ children } : { children : ReactElement })=>{
    const [ isAuthenticated ,setIsAuthenticated ] = useState<NormalUserAuthSaved>({
        accessToken : "",
        refreshToken : "",
        is2FactorAuthEnabled : false,
        isGoogleUser : false
    })
    const { getItem} = useLocalStorage()

    useEffect(()=>{
        const user = getItem("user")
        if(user) setIsAuthenticated(user)
    },[])

    return (
        <isAuth.Provider value={{isAuthenticated, setIsAuthenticated}} >
            {children}
        </isAuth.Provider>
    )
}

export { AuthProvider}

