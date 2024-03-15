import { createContext } from "react";
import { UserSaved } from "../../Types/dataTypes";


interface AuthContext {
    isAuthenticated : UserSaved
    setIsAuthenticated : React.Dispatch<React.SetStateAction<UserSaved>>
}

export const isAuth = createContext<AuthContext | null>(null)