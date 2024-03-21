import { useState } from "react"
import useInterceptor from "../hooks/useInterceptors"
import { AssessoryData } from "../../Types/dataTypes"
import ImageDiv from "../MiscComponents/ImageDiv"
import useImageHook from "../hooks/useImageHook"
import profilePictureUrlMaker from "../../utils/profilePictureUrlMaker"
import { useMutation } from "@tanstack/react-query"
import { addFriendRequest, deleteFriendRequest } from "../../api/dataService"

interface FriendRequestsProps {
    data : AssessoryData,
    isUserChangedSetter: (value : boolean) => void, 
    removeFollowRequest: (id : string, type : string)=> void,
}

export default function FriendRequests({ 
    data,  
    isUserChangedSetter, 
    removeFollowRequest 
}: FriendRequestsProps){
    // loading states for access and decline buttons
    const axiosPrivate = useInterceptor()
    const url = profilePictureUrlMaker(data.profilePicture)
    const image = useImageHook(url)
    const [ idToRemove, setIdToRemove] = useState("")

    const { mutate : addFriendMutation, isPending : isAddFriendPending } = useMutation({
        mutationFn : addFriendRequest,
        onSuccess : ()=>{
            isUserChangedSetter(true)
            removeFollowRequest(idToRemove, "followRequests")
        }
    })

    const { mutate : removeRequestMutation, isPending : isDeleteRequestPending } = useMutation({
        mutationFn : deleteFriendRequest,
        onSuccess : ()=>{
            isUserChangedSetter(true)
            removeFollowRequest(idToRemove, "followRequests")
        }
    })
    
    function addFriend(id : string){
        setIdToRemove(id)
        addFriendMutation({axiosPrivate , id})
    }

    function removeRequest(id : string){
        setIdToRemove(id)
        removeRequestMutation({axiosPrivate, id})
    }
    return (
        <div className=" p-3 flex justify-between items-center border-b-2 border-[#555555] h-28 lg:h-20">
            <div className=" flex justify-center items-center">
                <ImageDiv image={image} />
                <div className=" h-16 lg:h-12 w-[75vw] lg:w-[16.75rem] sm:w-[80vw] md:w-[85vw] flex flex-col justify-between items-start
                 ml-3 sm:ml-3 md:ml-5">
                    <p className="font-bold text-base sm:text-lg lg:text-xs">
                        {data.fullName}
                    </p>
                    <div className=" h-8 w-[100%] flex justify-between items-center">
                        <button className=" bg-red-600 hover:bg-red-700 h-[100%] w-[45%] rounded-md"
                        onClick={()=>addFriend(data._id)}
                        disabled={isAddFriendPending}>
                            {isAddFriendPending ? "Accepting" : "Accept"}
                        </button>
                        <button className="  bg-red-600 hover:bg-red-700 h-[100%] w-[45%] rounded-md " 
                        onClick={()=>removeRequest(data._id)}
                        disabled={isDeleteRequestPending}>
                            {isDeleteRequestPending ? "Decligning" : "Decline"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
