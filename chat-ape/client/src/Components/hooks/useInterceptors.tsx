import { useContext, useEffect } from "react";
import useLocalStorage from "./useLocalStorage";
import server, { axiosCustom } from "../../api/axios";
import { isAuth } from "../Context/authContext";

export default function useInterceptor() {

    const context = useContext(isAuth);
    
    if(!context) return axiosCustom

    const { isAuthenticated } = context 
    const { setItem } = useLocalStorage();

    // adds the inceptors on the request and response object
    // on request object the access token is attached with every request
    // if the request to backend fails it is checked if the previous request sent is the first try
    // if yes then a seperate request is sent to the server to refresh the access token which is stored again and the original
    // request with new access token is sent to the sever
    useEffect(() => {

        const requestInterceptor = axiosCustom.interceptors.request.use(
            (config) => {
                // checking if the authorization headers is already added this means the request was sent second time.
                if (!config.headers.Authorization) {
                    config.headers.Authorization = `Bearer ${isAuthenticated?.accessToken}`;
                    config.headers.isGoogleUser = isAuthenticated.isGoogleUser
                }

                return config;
            },
            (error) => Promise.reject(error)
        );

        const responseInterceptor = axiosCustom.interceptors.response.use(
            (response) => response,
            async (error) => {
                const previousRequest = error.config;
                if (error.response?.status === 401 && !previousRequest.firstTry) {
                    previousRequest.firstTry = true;
                    try {
                        const response = await server.post("/auth-user/refresh", { 
                            refreshToken: isAuthenticated.refreshToken,
                            isGoogleUser : isAuthenticated.isGoogleUser
                         });
                        const accessToken = response.data.newAccessToken as string;
                        previousRequest.headers.Authorization = `Bearer ${accessToken}`;
                        setItem("user", { 
                            accessToken, 
                            refreshToken: isAuthenticated.refreshToken, 
                            isGoogleUser : isAuthenticated.isGoogleUser
                        });
                        return axiosCustom(previousRequest);
                    } catch (error) {
                        console.log("The error occurred while refreshing the token", error);
                    }
                }
                return Promise.reject(error);
            }
        );
        // when the component unmounts the interceptors are removed
        return () => {
            axiosCustom.interceptors.request.eject(requestInterceptor);
            axiosCustom.interceptors.response.eject(responseInterceptor);
        };
    }, [isAuthenticated]);

    return axiosCustom;
}
