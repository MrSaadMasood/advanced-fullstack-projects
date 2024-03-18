import { createContext } from "react";
import { NormalUserAuthSaved, UserSaved } from "../../Types/dataTypes";


interface AuthContext {
    isAuthenticated : NormalUserAuthSaved
    setIsAuthenticated : React.Dispatch<React.SetStateAction<UserSaved>>
}

export const isAuth = createContext<AuthContext | null>(null)