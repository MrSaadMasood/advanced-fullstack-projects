import { IoArrowBackCircleOutline } from "react-icons/io5";
import { AcceptedDataOptions, CommonProp } from "../../Types/dataTypes";

interface ChatHeaderProps extends CommonProp {
    dataSent : AcceptedDataOptions, 
    friendChatImage : string
}
export default function ChatHeader({ 
    selectedChatSetter, 
    dataSent, 
    friendChatImage
}: ChatHeaderProps) {
    // this function is used for smaller devices to go back from the chat display to chat list display
    function goBack() {
        selectedChatSetter("");
    }

    return (
        <div className="h-16 sm:h-20 md:h-24 lg:h-20 bg-black border-b-2 border-[#555555] text-white
            flex justify-start items-center">
            <div className="w-auto h-14 ml-4 md:ml-8 lg:ml-3 flex justify-start items-center">
                <button 
                    data-testid="back"
                    onClick={goBack} 
                    className="lg:hidden"
                >
                    <IoArrowBackCircleOutline size={25} />
                </button>
                <div 
                    className="flex justify-center items-center">
                    <div 
                        className="h-10 md:h-14 w-10 md:w-14 rounded-full ml-6 overflow-hidden">
                        <img src={friendChatImage} alt="" width={"300px"} />
                    </div>
                    {dataSent.type === "group" &&
                    <p 
                        className="ml-3 sm:text-lg md:text-xl">
                        {dataSent.groupName}
                    </p>
                    } 
                    {dataSent.type === "normal" &&
                    <p 
                        className="ml-3 sm:text-lg md:text-xl">
                        {dataSent.fullName}
                    </p>
                    }
                </div>
            </div>
        </div>
    );
}

