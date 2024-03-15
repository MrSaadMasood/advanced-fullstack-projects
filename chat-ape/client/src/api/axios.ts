import axios from "axios";

// custom axios instances. One for login and signup and one for protected routes
const server = axios.create({
    baseURL : import.meta.env.VITE_REACT_APP_SITE_URL,
    headers : { "Content-Type" : "application/json"}
})

const axiosCustom = axios.create({
    baseURL : import.meta.env.VITE_REACT_APP_SITE_URL,
    headers : { "Content-Type" : "application/json"} 
})


export { axiosCustom }

export default server