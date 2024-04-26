import { ChatList, CommonProp, GetChatData } from "../../Types/dataTypes";
import profilePictureUrlMaker from "../../utils/profilePictureUrlMaker";
import useImageHook from "../hooks/useImageHook";
import ImageDiv from "../MiscComponents/ImageDiv";

interface MessageProps extends CommonProp {
    data : ChatList,
    getChatData : GetChatData, 
    chatFriendImageSetter : (url : string) => void
}
export default function NormalMessagesList({ 
    data, 
    selectedChatSetter, 
    getChatData, 
    chatFriendImageSetter 
} : MessageProps) { 
    const url = profilePictureUrlMaker(data.friendData.profilePicture)
    const dateObject = new Date(data.lastMessage.time);
    const image = useImageHook(url)

    // if the chat list contains a path to the image the data is fetched converted to url and shown 
    return (
        <button className={`hover:bg-[#343434] w-full p-3 flex lg:flex justify-between items-center border-b-2 
        border-[#555555] h-28 lg:h-20`}
            data-testid="normalMessageListItem"
            onClick={() => { 
                selectedChatSetter("normal"); 
                data.friendData.type = "normal"
                getChatData(data.friendData); 
                chatFriendImageSetter(image) 
            }}>

            <div className="flex justify-center items-center">
                <ImageDiv image={image} />
                <div className="h-16 lg:h-12 w-[17rem] lg:w-[13rem] sm:w-[26rem] flex flex-col justify-around items-start
                text-left ml-2 sm:ml-3 md:ml-5">
                    <p className="font-bold text-base sm:text-lg lg:text-xs">
                        {data.friendData.fullName}
                    </p>

                    {data.lastMessage.content &&
                        <p className="text-sm sm:text-base lg:text-xs text-[#b2b2b2] h-5 w-[16rem] sm:w-[22rem] lg:w-[10rem] flex overflow-hidden ">
                            {data.lastMessage.content}
                        </p>
                    }

                    {data.lastMessage.path &&
                        <p className="text-sm sm:text-base lg:text-xs text-[#b2b2b2] h-5 w-[16rem] sm:w-[22rem] lg:w-[10rem] flex overflow-hidden ">
                            Image Received
                        </p>
                    }
                </div>
            </div>

            <div className="h-16 w-20 lg:h-12 lg:w-14 flex flex-col justify-start items-center ml-1">
                <p className="text-xs">
                    {dateObject.toLocaleDateString()}
                </p>
            </div>
        </button>
    );
}
