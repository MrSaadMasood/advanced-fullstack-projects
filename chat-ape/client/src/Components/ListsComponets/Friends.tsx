import { useState } from "react";
import useInterceptor from "../hooks/useInterceptors";
import { AssessoryData, CommonProp, CommonUserData } from "../../Types/dataTypes";
import useImageHook from "../hooks/useImageHook";
import ImageDiv from "../MiscComponents/ImageDiv";
import profilePictureUrlMaker from "../../utils/profilePictureUrlMaker";

interface FriendsProps extends CommonProp {
    data : AssessoryData,
    selectedOptionSetter: (option : number, text : string) => void,
    isUserChangedSetter : (value : boolean)=> void, 
    removeFriendFromDataArray : (id : string, type : string)=> void,
    getChatData : (data : CommonUserData) => void, 
}

export default function Friends({ 
    data,
    selectedChatSetter, 
    selectedOptionSetter, 
    isUserChangedSetter, 
    removeFriendFromDataArray,
    getChatData
} : FriendsProps ){
    
    const axiosPrivate = useInterceptor()
    const url = profilePictureUrlMaker(data.profilePicture)
    const image = useImageHook(url)
    const [loading, setLoading] = useState(false)

    function sendMessage(data : AssessoryData){
        selectedOptionSetter(1, "Chats")
        selectedChatSetter("normal")
        const commonUserData : CommonUserData = {...data, type : "normal"}
        getChatData(commonUserData)
    }

    async function removeFriend(id : string){
        try {
            setLoading(true)
            await axiosPrivate.delete(`/user/remove-friend/${id}`)
            isUserChangedSetter(true) 
            removeFriendFromDataArray(id, "friends")
            setLoading(false)
        } catch (error) {
            console.log("error while removing the friends", error)
            setLoading(false)
        }
    }
    return(
        <div className=" p-3 flex justify-between items-center border-b-2 border-[#555555] h-28 lg:h-20">
            <div className=" flex justify-center items-center">
                <ImageDiv   image={image}  />
                <div className=" h-16 lg:h-12 w-[75vw] lg:w-[16.75rem] sm:w-[80vw] md:w-[85vw] flex flex-col justify-between items-start
                 ml-3 sm:ml-3 md:ml-5">
                    <p className="font-bold lg:w-48 lg:overflow-hidden text-base sm:text-lg lg:text-sm">
                        {data.fullName}
                    </p>
                    <div className=" h-8 lg:h-6 w-[100%] flex justify-between items-center">
                        <button onClick={()=>sendMessage(data)} 
                        className=" bg-red-600 hover:bg-red-700 h-[100%] w-[45%] rounded-md">
                            Message
                        </button>
                        <button 
                        onClick={()=>removeFriend(data._id)} 
                        className=" bg-red-600 hover:bg-red-700 h-[100%] w-[45%] rounded-md"
                        disabled={loading}
                        >
                            {loading ? "Removing" : "Remove"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

    

    