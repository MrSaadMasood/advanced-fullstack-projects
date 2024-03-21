import ChatHeader from "./ChatHeader";
import ErrorBox from "../ErrorComponents/ErrorBox";
import ChatForm from "../Forms/ChatForm";
import { ChatProps, CommonProp, GeneralGroupList, GroupChatData, UserData, handleFilterClicked } from "../../Types/dataTypes";
import useSendMessages from "../hooks/useSendMessages";
import useConditionalChatFetch from "../hooks/useConditionalChatFetch";
import MessageBox from "./MessageBox";

interface GroupChatProps extends ChatProps, CommonProp {
    data : GroupChatData[] ,
    generalGroupData : GeneralGroupList,
    groupImage : string,
    userData : UserData,
    handleChatSearchInputChange : (value : string)=>void
    chatSearchInput : string 
    handleIsFilterClicked : handleFilterClicked 
    handleIsMoreChatRequested : (value : boolean) => void
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
    handleChatSearchInputChange,
    chatSearchInput,
    handleIsFilterClicked,
    handleIsMoreChatRequested,
}: GroupChatProps ) {

    const {
        handleFileChange,
        handleSubmit,
        onChange
    } = useSendMessages({chatDataSetter, chatType : "group", sendMessageToWS , userData, generalGroupData})
    
    const { chatDiv } = useConditionalChatFetch(handleIsMoreChatRequested)

    function deleteMessage(id : string) {
        handleMessageDelete(id, "group");
    }

    return (
        <div className="lg:w-full">
            <ChatHeader
                selectedChatSetter={selectedChatSetter}
                dataSent={generalGroupData}
                friendChatImage={groupImage}
                handleChatSearchInputChange={handleChatSearchInputChange} 
                chatSearchInput={chatSearchInput}
                handleIsFilterClicked={handleIsFilterClicked}
            />

            <div
                ref={chatDiv}
                className="chatbox h-[90vh] md:h-[92vh] lg:h-[82vh] p-2 pb-20 md:pb-32 lg:pb-4 relative 
                bg-black w-full lg:w-full overflow-y-scroll noScroll"
            >
                {data.map((chatData, index) => (
                    chatData.chat.error ? <ErrorBox key={index} data={chatData.chat} /> :
                    chatData.chat.userId === userData._id ? 
                    <MessageBox 
                        key={index} 
                        data={chatData.chat} 
                        deleteMessage={deleteMessage} 
                        chatType="group" 
                        sender={chatData.senderName}
                        boxSide="right"
                    /> :
                    <MessageBox 
                        key={index}
                        deleteMessage={deleteMessage}
                        data={chatData.chat}
                        sender={chatData.senderName}
                        chatType="group"
                        boxSide="left"
                    />
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
