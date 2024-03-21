import { CommonProp, GeneralGroupList, GetChatData, UserData } from "../../Types/dataTypes";
import useImageHook from "../hooks/useImageHook";
import ImageDiv from "../MiscComponents/ImageDiv";

interface GroupMessagesListProp extends CommonProp {
    data : GeneralGroupList,
    userData : UserData,
    getChatData : GetChatData,
    chatFriendImageSetter : (url : string) => void,   
}
export default function GroupMessagesList({
    data,
    userData,
    selectedChatSetter,
    getChatData,
    chatFriendImageSetter,
} : GroupMessagesListProp ) {

    const dateObject = new Date(data.lastMessage.time);
    const url = data.groupImage ? `/user/group-picture/${data.groupImage}` : undefined
    const picture = useImageHook(url)
    
    return (
        <button
            data-testid="main"
            className={`hover:bg-[#343434] w-full p-3 flex lg:flex justify-between items-center 
            border-b-2 border-[#555555] h-28 lg:h-20`}
            onClick={() => {
                data.type = "group"
                selectedChatSetter("group");
                getChatData(data);
                chatFriendImageSetter(picture);
            }}
        >
            <div className="flex justify-center items-center">
                <ImageDiv image={picture} />
                <div className="h-16 lg:h-12 w-[17rem] lg:w-[13rem] sm:w-[26rem] flex flex-col justify-around items-start ml-2 sm:ml-3 md:ml-5">
                    <p className="font-bold text-base sm:text-lg lg:text-xs">
                        {data.groupName}
                    </p>
                    {data?.lastMessage?.path && 
                        <p className="text-sm sm:text-base lg:text-xs text-[#b2b2b2] h-5 w-[16rem] 
                        sm:w-[22rem] lg:w-[10rem] flex overflow-hidden">
                            Image
                        </p>
                    }
                    {data?.lastMessage?.content && 
                        <div className="text-sm sm:text-base lg:text-xs text-[#b2b2b2] w-[16rem] 
                        sm:w-[22rem] lg:w-[14rem] text-left">
                            <p className="w-[100%] h-4">
                                {data.lastMessage.userId === userData._id ? "You" : data.senderName}:
                                <span> </span>
                                {data.lastMessage.content}
                            </p>
                        </div>
                    }
                </div>
            </div>
            <div className="h-16 w-20 lg:h-12 lg:w-14 flex flex-col justify-start items-center ml-1">
                <p className="text-xs">{dateObject.toLocaleDateString()}</p>
            </div>
        </button>
    );
}
