import { lazy, Suspense, useContext } from "react";
import { Outlet } from "react-router-dom";
import { isAuth } from "./Context/authContext";
import Loader from "./ReuseableFormComponents/Loader";

const Login = lazy(()=> import("./AuthComponents/Login"))

export default function PrivateRoute(){

    const { isAuthenticated } = useContext(isAuth)

    return (
        <div>
            {
                isAuthenticated.accessToken !== "" ? (<Outlet />) : (
                    <Suspense fallback={<Loader />} >
                        <Login />
                    </Suspense>
                )
            }
        </div>
    )
}