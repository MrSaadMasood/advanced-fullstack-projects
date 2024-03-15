import { ChatType, Message } from "../../Types/dataTypes";
import useImageHook from "../hooks/useImageHook";

interface LeftSideBoxProps {
    data : Message,
    sender? : string,
    chatType : ChatType
}
export default function LeftSideBox({ 
    data, 
    sender, 
    chatType  
}: LeftSideBoxProps) {
    const url = data.path ? (chatType === "normal" ? `/user/get-chat-image/${data.path}` : `/user/group-picture/${data.path}`) : undefined
    const picture = useImageHook(url)
    const dateObject = new Date(data.time);

    return (
        <div data-testid="main" className="text-white text-base w-[100%] h-auto mb-2 
        flex justify-start items-center">
            <div className="w-[60%] ml-3 h-auto flex flex-col justify-between items-start">
                <div className="text-[.5rem] h-4 w-auto flex justify-between items-center">
                    <p>
                        {dateObject.toDateString()}
                    </p>
                    {sender &&
                        <p className="ml-2">
                            {sender}
                        </p>
                    }
                </div>
                {data.content &&
                    <p className="pt-1 pb-1 pl-2 pr-2 bg-orange-600 h-auto w-auto break-all 
                        left-box flex justify-center items-center">
                        {data.content}
                    </p>
                }
                {data.path &&
                    <div>
                        <img src={picture} alt="" width={"300px"} />
                    </div>
                }
            </div>
        </div>
    );
}
