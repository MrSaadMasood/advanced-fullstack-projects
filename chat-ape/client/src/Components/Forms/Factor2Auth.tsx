import { useContext, useEffect, useRef, useState } from "react"
import { isAuth } from "../Context/authContext"
import useLocalStorage from "../hooks/useLocalStorage"
import { useMutation, useQuery } from "@tanstack/react-query"
import { factor2AuthLogin, fetchQRCode } from "../../api/dataService"
import { Factor2AuthEnabledUser } from "../../Types/dataTypes"
import { ColorRing } from "react-loader-spinner"
import { useNavigate } from "react-router-dom"

function Factor2Auth() {
    const context = useContext(isAuth)
    if(!context) return

    const [ factor2AuthData, setFactor2AuthData ] = useState<Factor2AuthEnabledUser>()
    console.log("the factor 2 auth data is", factor2AuthData)
    const [ code , setCode ] = useState<string[]>(Array(6).fill(""))
    const [ isPasskeyButtonClicked, setIsPasskeyButtonClicked ] = useState(false)
    const [ errorMessage , setErrorMessage] = useState("")
    const { setIsAuthenticated } = context
    const { getItem , setItem, removeItem} = useLocalStorage()
    const  navigate = useNavigate()

    const inputRef = useRef<HTMLInputElement[]>([])

    const { data : QRcode = "", isLoading , error } = useQuery({
        queryKey : [factor2AuthData],
        queryFn : async () => {
            if(!factor2AuthData) return
            return await fetchQRCode(factor2AuthData.factor2AuthToken)
        },
        enabled : !!factor2AuthData,
        staleTime : Infinity
    })
    const { mutate : factor2AuthMutation, status } = useMutation({
        mutationFn : factor2AuthLogin,
        onSuccess : (data)=>{
            console.log("the data on successfull otp submission is", data)
            setIsAuthenticated(data)
            removeItem("f2a")
            setItem("user", data)
            navigate("/")
        },
        onError : ()=> setErrorMessage("Failed to verify the Otp. Try Again!")
    })

    useEffect(()=>{ 
       const f2a = getItem("f2a") 
       if(!f2a || !f2a.is2FactorAuthEnabled) return navigate("/login")
       setFactor2AuthData(f2a)

     },[])

    function handleInputChange(value : string, index : number){
        if(value.length > 1) return setErrorMessage("Only 1 number is allowed per box")
        const prevArray = [...code]
        prevArray[index] = value
        setCode(prevArray)

        if(index < inputRef.current.length - 1){
            inputRef.current[index + 1].focus()
        }
    }
    function handleSubmission(){
        if(!factor2AuthData) return
        const passKey = code.join("")
        if(passKey.length < 6 || passKey.length > 6) return setErrorMessage("Please fill all th fields")
        factor2AuthMutation({ otp : passKey , refreshToken : factor2AuthData.refreshToken, factor2AuthToken : factor2AuthData.factor2AuthToken})
    }
     return (
        <div className=" w-screen h-screen bg-black flex flex-col justify-center items-center text-white">
            <div className=" bg-gray-600 w-[85%] h-[40%] md:w-[40rem] md:h-[50%] rounded-lg  flex flex-col justify-start overflow-hidden">
                <div className="h-[20%] w-full flex justify-around text-xl font-bold ">
                    <button 
                        className={` bg-gray-800 w-[50%] ${!isPasskeyButtonClicked && "shadow-inner"} shadow-gray-500`}
                        onClick={()=>setIsPasskeyButtonClicked(false)}
                    >
                        QR Code
                    </button>
                    <button 
                        className={` bg-gray-800 w-[50%] ${isPasskeyButtonClicked && "shadow-inner"} shadow-gray-500`} 
                        onClick={()=> setIsPasskeyButtonClicked(true)}    
                    >
                        Passkey
                    </button>
                </div>
                {!isPasskeyButtonClicked && 
                    <div className=" h-[80%] flex justify-center items-center">
                        {isLoading &&
                            <ColorRing
                                visible={true}
                                height="80"
                                width="80"
                                ariaLabel="color-ring-loading"
                                wrapperStyle={{}}
                                wrapperClass="color-ring-wrapper"
                                colors={['#e15b64', '#f47e60', '#f8b26a', '#abbd81', '#849b87']}
                                />
                        }
                        {error &&
                            <p className=" font-bold text-lg sm:text-xl md:text-2xl">
                                Failed to get the QR Code. Try Again!
                            </p>
                        }
                        {QRcode && 
                            <img src={QRcode} alt="" />
                        }
                </div>
                }
                {isPasskeyButtonClicked &&
                    <div className=" h-[80%] flex flex-col justify-center items-center text-white">
                        <form className=" w-full h-full flex flex-col justify-center items-center">
                            <div className="mb-4 font-bold text-lg sm:text-xl md:text-2xl">
                                Enter The OTP Here:
                            </div> 
                            <div className=" flex justify-center items-center">
                                {Array.from({ length : 6 }, (_ , index )=>(
                                    <input 
                                        type="number"
                                        key={index}
                                        maxLength={1}
                                        ref= { element => inputRef.current[index] = element as HTMLInputElement}
                                        onChange={(e)=> handleInputChange( e.target.value, index)}
                                        className=" bg-gray-400 w-10 p-4 ml-2 flex justify-center items-center rounded-md"
                                        required    
                                    />
                                ))}
                            </div>
                            {errorMessage && 
                                <div className=" mt-2 text-xs md:text-sm">
                                    {errorMessage}
                                </div>
                            }
                            <button 
                                onClick={handleSubmission}
                                type="button"
                                disabled={status === "pending"}
                                className="bg-[#4E9F3D] mt-4 w-[4.5rem] h-10 p-2 sm:text-lg md:p-6 flex justify-center items-center
                                    rounded-md hover:bg-[#5ab747] cursor-pointer"
                            >
                                {status === "pending" ? "Submitting" : "Submit"}
                            </button>
                        </form>
                    </div> 
                }
            </div>
            <div className=" mt-6 w-[75%] h-auto text-center sm:text-lg md:text-xl">
                <p>
                    Scan the Given QR Code with Google Authenticator App
                </p>
            </div>
        </div>
     )
}

export default Factor2Auth  