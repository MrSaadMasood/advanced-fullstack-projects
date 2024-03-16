import { ChatType, Message } from "../../Types/dataTypes";
import useImageHook from "../hooks/useImageHook";

interface RightSideBoxProps {
    data : Message,
    sender? : string,
    deleteMessage : (id: string)=> void
    chatType : ChatType
}
export default function RightSideBox({ 
    data, 
    sender, 
    deleteMessage, 
    chatType 
} : RightSideBoxProps) {
    
    const url = data.path ? chatType === "normal" ? `/user/get-chat-image/${data.path}` : `/user/group-picture/${data.path}` : undefined
    const picture = useImageHook(url)
    const dateObject = new Date(data.time);

    return (
        <div 
            onDoubleClick={() => deleteMessage(data.id)} 
            data-testid="main"
            className="text-white text-base w-[100%] h-auto mb-2 flex justify-end items-center cursor-pointer"
        >
            <div className="w-[60%] mr-3 h-auto flex flex-col justify-between items-end">
                <div className="text-[.5rem] h-4 w-auto flex justify-around items-center">
                    {sender &&
                        <p className="mr-2">
                            {sender}
                        </p>
                    }
                    <p className="">
                        {dateObject.toDateString()}
                    </p>
                </div>
                {data.content &&
                    <div className="pt-1 pb-1 pl-2 pr-2 bg-orange-600 h-auto w-auto break-all right-box flex 
                    justify-center items-center">
                        {data.content}
                    </div>
                }
                {data.path &&
                    <div>
                        <img src={picture} alt="img" width={"300px"} />
                    </div>
                }
            </div>
        </div>
    );
}