import {  useContext, useEffect, useState } from "react";
import * as Yup from 'yup' 
import { Link, useNavigate } from "react-router-dom";
import useLocalStorage from "../hooks/useLocalStorage";
import server from "../../api/axios";
import { isAuth } from "../Context/authContext";
import { Form, Formik } from "formik";
import { FormDataLogin } from "../api/Types/typings";
import { useMutation } from "@tanstack/react-query";
import { loginUser } from "../../api/dataService";

import TextInput from "../ReuseableFormComponents/TextInput";
import SubmitButton from "../ReuseableFormComponents/SubmitButton";
import ErrorDiv from "../ReuseableFormComponents/ErrorDiv";
import PasswordCheckBox from "../ReuseableFormComponents/PasswordCheckBox";

export default function LoginForm() {
    // is input checked
    const [checked, setChecked] = useState(false);
    // if login failed its set to true
    const [isFailed, setIsFailed] = useState(false);
    const [errorMessage, setErrorMessage] = useState("Failed to Log the User in! Try Again");
    const navigate = useNavigate();
    const { setItem } = useLocalStorage();
    const { mutate : loginUserMutation } = useMutation({
        mutationFn : loginUser,
        onSuccess : (data)=>{
            const userData = {
                accessToken: data.accessToken,
                refreshToken: data.refreshToken,
            }
            setItem("user", userData );
            setIsAuthenticated(userData);
            navigate("/", { state: { userData: userData }, replace: true });
        },
        onError : ()=> setIsFailed(true)
    })
    const context = useContext(isAuth);
    if(!context) return
    const { isAuthenticated, setIsAuthenticated } = context

    const initialValues = {
        email : "",
        password : ""
    }
    const width = isFailed ? "w-[23rem] h-auto" : "w-0 h-0";

    useEffect(() => {
      
        if(isAuthenticated.accessToken.length > 1) {
            
            navigate("/", { replace : true})
        }
    
    }, [isAuthenticated.accessToken])
    
    useEffect(() => {
        if (isFailed) {
            const timer = setTimeout(() => {
                setErrorMessage("");
                setIsFailed(false);
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [isFailed]);

    function handleSubmission(values : FormDataLogin){
        loginUserMutation({ server , formData : values })
    }
    return (
        <Formik clasName="form-wrap"
            initialValues={initialValues}
            validationSchema={Yup.object({
                email : Yup.string().email("Invalid email provided").required("Required"),
                password : Yup.string().required("Please provide a password")
                            .min(8, "Password is too Short")
                            .max(24, "Password is too Long")
                            .matches(/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*\W)(?!.* )/, 
                                "Password must contain a CapitaL, Small and Special Character")
            })}
            onSubmit={handleSubmission}
        >
            <Form>
                <div className="form-group text-white">
                    <TextInput
                        label="Email"
                        name="email"
                        type="text"
                        id="email"
                        data-testid="email"
                        className="p-2 h-12 w-[23rem]"
                    />   
                </div>
                <div className="form-group text-white">
                    <TextInput
                        label="Password"
                        name="password"
                        type={checked ? "text" : "password"}
                        id="password"
                        data-testid="password"
                        className="p-2 h-12 w-[23rem]"
                    />   
                </div>
                <PasswordCheckBox checked={checked} setChecked={setChecked} />
                <div className="flex justify-between items-center">
                    <SubmitButton value="Log In" />
                    <Link to={"/sign-up"} className="text-sm text-[#999999] hover:text-[#c8c8c8]">Sign up</Link>
                </div>
                <div className=" relative mt-4 mb-6 border-b-2 border-gray-600 flex justify-center items-center">
                    <p className="absolute text-gray-500 bg-black">
                        OR
                    </p>
                </div>
                <div className=" flex flex-col justify-between items-center h-[10rem]">
                    <button 
                        className="p-2 h-10 w-[23rem] rounded-lg bg-red-600 hover:bg-red-700 "
                        type="submit"
                        onClick={()=>handleSubmission({email : "saad@gmail.com" , password : "Saad.Masood1122"})}    
                    >
                        Guest Login
                    </button>
                    <button 
                        className="p-2 h-10 w-[23rem] rounded-lg bg-red-600 hover:bg-red-700 "
                        type="submit"
                    >
                        Sign in Using Gmail
                    </button>
                    <button 
                        className="p-2 h-10 w-[23rem] rounded-lg bg-red-600 hover:bg-red-700 "
                        type="submit"
                    >
                        Using GitHub
                    </button>
                </div>
                
                <ErrorDiv width={width} isFailed={isFailed} errorMessage={errorMessage} />
            </Form>
        </Formik>
    );
}
