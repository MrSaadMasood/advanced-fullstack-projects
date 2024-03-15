import { useState } from "react";
import useInterceptor from "../hooks/useInterceptors";
import { AssessoryData, UserData } from "../../Types/dataTypes";
import ImageDiv from "../MiscComponents/ImageDiv";
import useImageHook from "../hooks/useImageHook";
import profilePictureUrlMaker from "../../utils/profilePictureUrlMaker";

interface UsersProps {
    data : AssessoryData, 
    userData : UserData, 
    addToSentRequests : (id: string)=> void, 
    isUserChangedSetter : (value: boolean) => void
}

export default function Users({ 
    data, 
    userData, 
    addToSentRequests, 
    isUserChangedSetter 
}: UsersProps) {
    const axiosPrivate = useInterceptor();
    const url = profilePictureUrlMaker(data.profilePicture)
    const image = useImageHook(url)
    const [ loading , setLoading ] = useState(false)
    const isRequestSend = userData.sentRequests.includes(data._id);
    const backgroundColor = isRequestSend ? "bg-red-400" : "bg-red-600 hover:bg-red-700";

    // to the send the follow request to the user
    async function sendRequest() {
        try {
            setLoading(true)
            await axiosPrivate.post("/user/send-request", { receiverId: data._id });
            addToSentRequests(data._id);
            isUserChangedSetter(true);
            setLoading(false)
        } catch (error) {
            console.error("Request sending failed:", error);
            setLoading(false)
        }
    }

    console.log('the data send to the users component is', data)
    return (
        <div className="p-3 flex justify-between items-center border-b-2 border-[#555555] h-28 lg:h-20">
            <div className="flex justify-center items-center">
                <ImageDiv image={image} />
                <div className="h-16 lg:h-12 w-[75vw] lg:w-[16.75rem] sm:w-[80vw] md:w-[85vw] flex flex-col justify-between items-start ml-3 sm:ml-3 md:ml-5">
                    <p className="font-bold lg:w-48 lg:overflow-hidden text-base sm:text-lg lg:text-sm">
                        {data.fullName}
                    </p>
                    <div className="h-8 lg:h-6 w-[100%] flex justify-between items-center">
                        {!loading && 
                            <button
                                className={`h-[100%] w-[95%] rounded-md ${backgroundColor}`}
                                onClick={sendRequest}
                                disabled={isRequestSend}
                            >
                                {isRequestSend ? "Request Sent" : "Follow"}
                            </button>
                        }
                        {loading && 
                            <button
                                className={`h-[100%] w-[95%] rounded-md ${backgroundColor}`}
                                disabled={true}
                            >
                                Sending
                            </button>
                        } 
                    </div>
                </div>
            </div>
        </div>
    );
}
