import {  useEffect, useRef} from "react";
import ErrorBox from "../ErrorComponents/ErrorBox";
import ChatForm from "../Forms/ChatForm";
import ChatHeader from "./ChatHeader";
import LeftSideBox from "./LeftSideBox";
import RightSideBox from "./RightSideBox";
import { ChatData, ChatProps, CommonProp, CommonUserData, UserData } from "../../Types/dataTypes";
import useSendMessages from "../hooks/useSendMessages";

interface Props extends CommonProp, ChatProps {
  completeChatData : ChatData,
  friendData : CommonUserData,
  userData : UserData,
  friendChatImage : string, 
}
export default function Chat({
  selectedChatSetter,
  completeChatData,
  friendData,
  userData,
  sendMessageToWS,
  chatDataSetter,
  handleMessageDelete,
  friendChatImage,
} : Props) {

  // reference to scroll to the bottom of the overflowing div authomatically
  const chatDiv = useRef<HTMLDivElement>(null);
  const {
    handleFileChange,
    handleSubmit,
    onChange
  } = useSendMessages({chatDataSetter, chatType : "normal", sendMessageToWS, userData, friendData})
  const realChat = completeChatData.chat;

  useEffect(() => {

      const div = chatDiv.current;
      function scrollToBottom() {
          if(!div) return
          div.scrollTop = div.scrollHeight;
    }

      scrollToBottom();
  }, [completeChatData.chat]);


  function deleteMessage(id : string) {
    handleMessageDelete(id, "normal");
  }

  return (
    <div className="lg:w-full">
        <ChatHeader
        selectedChatSetter={selectedChatSetter}
        dataSent={friendData}
        friendChatImage={friendChatImage}
        />

        <div
        ref={chatDiv}
        className="chatbox h-[90vh] md:h-[92vh] lg:h-[82vh] p-2 pb-20 md:pb-32 lg:pb-4 relative
        bg-black w-full lg:w-full overflow-y-scroll noScroll"
        >
        {realChat?.map((chat, index) => {
            if (chat.error && chat.userId === userData._id) {
                return <ErrorBox 
                          key={index} 
                          data={chat} 
                        />;
        }
            if (chat.userId === userData._id) {
                return <RightSideBox 
                          key={index} 
                          data={chat} 
                          deleteMessage={deleteMessage} 
                          chatType="normal"
                          />;
        } 
            else {
                return <LeftSideBox 
                          key={index} 
                          data={chat} 
                          chatType="normal"
                        />;
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