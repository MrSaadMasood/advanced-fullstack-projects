import { createContext } from "react";
import { NormalUserAuthSaved } from "../../Types/dataTypes";


interface AuthContext {
    isAuthenticated : NormalUserAuthSaved
    setIsAuthenticated : React.Dispatch<React.SetStateAction<NormalUserAuthSaved>>
}

export const isAuth = createContext<AuthContext | null>(null)