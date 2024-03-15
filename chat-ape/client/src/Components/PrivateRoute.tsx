import { useContext } from "react";
import { ColorRing } from "react-loader-spinner";
import Login from "./AuthComponents/Login";
import { Outlet } from "react-router-dom";
import { isAuth } from "./Context/authContext";

export default function PrivateRoute(){

    const context = useContext(isAuth)
    if(!context) {
        return <ColorRing
            visible={true}
            height="80"
            width="80"
            ariaLabel="color-ring-loading"
            wrapperStyle={{}}
            wrapperClass="color-ring-wrapper"
            colors={['#e15b64', '#f47e60', '#f8b26a', '#abbd81', '#849b87']}
  />
    }
    const { isAuthenticated } = context
    
    console.log("the users stored in app is", isAuthenticated)

    return (
        <div>
            {
                isAuthenticated.accessToken !== "" ? (<Outlet />) : (<Login />)
            }
        </div>
    )
}