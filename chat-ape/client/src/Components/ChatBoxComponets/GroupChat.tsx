import {  useEffect, useRef} from "react";

import ChatHeader from "./ChatHeader";
import ErrorBox from "../ErrorComponents/ErrorBox";
import ChatForm from "../Forms/ChatForm";
import LeftSideBox from "./LeftSideBox";
import RightSideBox from "./RightSideBox";
import { ChatProps, CommonProp, GeneralGroupList, GroupChatData, UserData } from "../../Types/dataTypes";
import useSendMessages from "../hooks/useSendMessages";

interface GroupChatProps extends ChatProps, CommonProp {
    data : GroupChatData[] ,
    generalGroupData : GeneralGroupList,
    groupImage : string,
    userData : UserData,
}

export default function GroupChat({
    data,
    generalGroupData,
    sendMessageToWS,
    chatDataSetter,
    selectedChatSetter,
    handleMessageDelete,
    groupImage,
    userData,
}: GroupChatProps ) {

    const chatDiv = useRef<HTMLInputElement>(null);
    const {
        handleFileChange,
        handleSubmit,
        onChange
    } = useSendMessages({chatDataSetter, chatType : "group", sendMessageToWS , userData, generalGroupData})

    // to scroll the overflowing div to the bottom
    useEffect(() => {
        const div = chatDiv.current;

        function scrollToBottom() {
            if(!div) return
            div.scrollTop = div.scrollHeight;
        }

        scrollToBottom();
    }, []);

    function deleteMessage(id : string) {
        handleMessageDelete(id, "group");
    }

    return (
        <div className="lg:w-full">
            <ChatHeader
                selectedChatSetter={selectedChatSetter}
                dataSent={generalGroupData}
                friendChatImage={groupImage}
            />

            <div
                ref={chatDiv}
                className="chatbox h-[90vh] md:h-[92vh] lg:h-[82vh] p-2 pb-20 md:pb-32 lg:pb-4 relative 
                bg-black w-full lg:w-full overflow-y-scroll noScroll"
            >
                {data.map((chatData, index) => {
                    if (chatData.chat.error && chatData.chat.userId === userData._id) {
                        return <ErrorBox key={index} data={chatData.chat} />;
                    }
                    if (chatData.chat.userId === userData._id) {
                        return (
                            <RightSideBox
                                key={index}
                                data={chatData.chat}
                                deleteMessage={deleteMessage}
                                chatType="group"
                                sender={chatData.senderName}
                            />
                        );
                    } else {
                        return (
                            <LeftSideBox
                                chatType="group"
                                key={index}
                                data={chatData.chat}
                                sender={chatData.senderName}
                            />
                        );
                    }
                })}
            </div>
            <div>
                <ChatForm
                    handleFileChange={handleFileChange}
                    handleSubmit={handleSubmit}
                    onChange={onChange}
                />
            </div>
        </div>
    );
}
