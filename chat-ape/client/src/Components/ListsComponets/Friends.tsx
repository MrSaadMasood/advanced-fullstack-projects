import { useState } from "react";
import useInterceptor from "../hooks/useInterceptors";
import { CommonProp, CommonUserData, FriendData, GetChatData } from "../../Types/dataTypes";
import useImageHook from "../hooks/useImageHook";
import ImageDiv from "../MiscComponents/ImageDiv";
import profilePictureUrlMaker from "../../utils/profilePictureUrlMaker";
import { useMutation } from "@tanstack/react-query";
import { removeAFriend } from "../../api/dataService";
import useOptionsSelected from "../hooks/useOptionsSelected";

interface FriendsProps extends CommonProp {
    data : FriendData,
    selectedOptionSetter: (option : number, text : string) => void,
    isUserChangedSetter : (value : boolean)=> void, 
    getChatData : GetChatData, 
    setGlobalError : React.Dispatch<React.SetStateAction<string>>
}

export default function Friends({ 
    data,
    selectedChatSetter, 
    selectedOptionSetter, 
    isUserChangedSetter, 
    getChatData,
    setGlobalError
} : FriendsProps ){
    const axiosPrivate = useInterceptor()
    const url = profilePictureUrlMaker(data.profilePicture)
    const { removeFollowRequestAndFriend } = useOptionsSelected()
    const image = useImageHook(url)
    const [ removedFriendId , setRemovedFriendId ]= useState("")

    const { mutate : removeFriendMutation, isPending : isRemoveFriendPending } = useMutation({
        mutationFn : removeAFriend,
        onSuccess : ()=>{
            removeFollowRequestAndFriend(removedFriendId, "friends")
            isUserChangedSetter(true)
        },
        onError : ()=> setGlobalError("Failed to Remove Friend! Try Again")
    })

    function sendMessage(data : FriendData){
        selectedOptionSetter(1, "Chats")
        selectedChatSetter("normal")
        const commonUserData : CommonUserData = {...data, type : "normal",}
        getChatData(commonUserData)
    }

    function removeFriend(id : string){
        setRemovedFriendId(id)
        removeFriendMutation({ axiosPrivate, id, collectionId : data.collectionId})
    }
    return(
        <section className=" p-3 flex justify-between items-center border-b-2 border-[#555555] h-28 lg:h-20">
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
                        disabled={isRemoveFriendPending}
                        >
                            {isRemoveFriendPending ? "Removing" : "Remove"}
                        </button>
                    </div>
                </div>
            </div>
        </section>
    )
}

    

    