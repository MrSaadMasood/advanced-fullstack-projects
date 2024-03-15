import { useContext, useEffect, useState } from "react";
import * as Yup from 'yup' 
import { useNavigate } from "react-router-dom";
import { isAuth } from "../Context/authContext";
import { Form, Formik } from "formik";
import TextInput from "../ReuseableFormComponents/TextInput";
import { useMutation } from "@tanstack/react-query";
import server from "../../api/axios";
import { userSignUp } from "../../api/dataService";
import { SignUpFormdata } from "../api/Types/typings";
import SubmitButton from "../ReuseableFormComponents/SubmitButton";
import ErrorDiv from "../ReuseableFormComponents/ErrorDiv";
import PasswordCheckBox from "../ReuseableFormComponents/PasswordCheckBox";

export default function SignUpForm() {
    const [checked, setChecked] = useState(false);
    const [isFailed, setIsFailed] = useState(false);
    const [errorMessage, setErrorMessage] = useState("Could not sign you up, try again!");
    const navigate = useNavigate();
    const { mutate : userSignUpMutation } = useMutation({
        mutationFn : userSignUp,
        onSuccess : ()=> navigate("/login", { replace : true}),
        onError : ()=> setIsFailed(true)
    })
    const context = useContext(isAuth)

    if(!context) return
    const { isAuthenticated } = context

    const width = isFailed ? "w-[23rem] h-auto" : "w-0 h-0";

    useEffect(() => {
      
        if(isAuthenticated.accessToken.length > 1) {
            
            navigate("/", { replace : true})
        }
    
    }, [isAuthenticated.accessToken])
    
    // timer to remove the error div
    useEffect(() => {
        if (isFailed) {
            const timer = setTimeout(() => {
                setErrorMessage("");
                setIsFailed(false);
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [isFailed]);

    function handleSubmission(values : SignUpFormdata){
        userSignUpMutation({ server , formData : values})
    } 
    
    return (
        <Formik
            initialValues={{
                fullName : "",
                email : "",
                password : ""
            }}
            validationSchema={Yup.object({
                fullName : Yup.string().max(30, "Must be 30 Characters or Less").required("Required"),
                email : Yup.string().email("Invalid email provided").required("Required"),
                password : Yup.string().required("Please provide a password")
                            .min(8, "Password is too Short")
                            .max(24, "Password is too Long")
                            .matches(/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*\W)(?!.* )/, 
                                "Password must contain a CapitaL, Small and Special Character")
            })}
            onSubmit={handleSubmission}
        >
            <Form className="form-wrap">
                <div className="form-group text-white">
                    <TextInput
                        label="Full Name"
                        name="fullName"
                        type="text"
                        id="fullName"
                        data-testid="fullName"
                        className="p-2 h-12 w-[23rem]"
                    />   
                </div>
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
                <SubmitButton value="Sign Up" />
                <ErrorDiv width={width} isFailed={isFailed} errorMessage={errorMessage} /> 
            </Form>
        </Formik>
    );
}
