import { useContext } from "react";
import Login from "./AuthComponents/Login";
import { Outlet } from "react-router-dom";
import { isAuth } from "./Context/authContext";

export default function PrivateRoute(){

    const { isAuthenticated } = useContext(isAuth)

    return (
        <div>
            {
                isAuthenticated.accessToken !== "" ? (<Outlet />) : (<Login />)
            }
        </div>
    )
}