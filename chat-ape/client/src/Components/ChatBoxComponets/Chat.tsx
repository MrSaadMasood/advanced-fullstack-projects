import ErrorBox from "../ErrorComponents/ErrorBox";
import ChatForm from "../Forms/ChatForm";
import ChatHeader from "./ChatHeader";
import { ChatData, ChatProps, CommonProp, CommonUserData, OpenGroupManager, UserData, handleFilterClicked } from "../../Types/dataTypes";
import useSendMessages from "../hooks/useSendMessages";
import useConditionalChatFetch from "../hooks/useConditionalChatFetch";
import MessageBox from "./MessageBox";
import { useCallback, useMemo } from "react";

interface Props extends CommonProp, ChatProps {
  completeChatData : ChatData,
  friendData : CommonUserData,
  userData : UserData,
  friendChatImage : string, 
  handleChatSearchInputChange : (value : string)=>void
  chatSearchInput : string 
  handleIsFilterClicked : handleFilterClicked
  // handleIsMoreChatRequested : (value : boolean)=> void,
  setGlobalError : React.Dispatch<React.SetStateAction<string>>
  openGroupManager : OpenGroupManager
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
  handleChatSearchInputChange,
  chatSearchInput,
  handleIsFilterClicked,
  // handleIsMoreChatRequested,
  setGlobalError,
  openGroupManager 
} : Props) {

  // reference to scroll to the bottom of the overflowing div authomatically
  const {
    handleFileChange,
    handleSubmit,
    onChange
  } = useSendMessages({chatDataSetter, setGlobalError, chatType : "normal", sendMessageToWS, userData, friendData})

  const { chatDiv } = useConditionalChatFetch()

  const realChat = useMemo(()=> completeChatData.chat, [ completeChatData ])

  const deleteMessage = (id : string) => {
    handleMessageDelete(id, "normal");
  }


  return (
    <div className="lg:w-full">
        <ChatHeader
        selectedChatSetter={selectedChatSetter}
        dataSent={friendData}
        friendChatImage={friendChatImage}
        handleChatSearchInputChange={handleChatSearchInputChange} 
        chatSearchInput={chatSearchInput}
        handleIsFilterClicked={handleIsFilterClicked}
        openGroupManager={openGroupManager}
        />

        <div
        ref={chatDiv}
        className="chatbox h-[90vh] md:h-[92vh] lg:h-[82vh] p-2 pb-20 md:pb-32 lg:pb-4 relative
        bg-black w-full lg:w-full overflow-y-scroll noScroll"
        >
        {realChat.map((chat, index) => (
            chat.error ? <ErrorBox key={index} data={chat} /> :
            chat.userId === userData._id ? 
            <MessageBox key={index} data={chat} chatType="normal" boxSide="right" deleteMessage={deleteMessage} /> :
            <MessageBox key={index} data={chat} chatType="normal" boxSide="left" deleteMessage={deleteMessage} />

        ))}
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