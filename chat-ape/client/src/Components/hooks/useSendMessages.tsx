import { useMutation } from "@tanstack/react-query";
import { ChatProps, ChatType, CommonUserData, GeneralGroupList, UserData } from "../../Types/dataTypes";
import useInterceptor from "./useInterceptors";
import { sendImageMessage, sendTextMessage } from "../../api/dataService";
import { FormEvent, useState } from "react";

interface useSendMessagesProps extends Omit<ChatProps , "handleMessageDelete"> {
    userData : UserData,
    friendData? : CommonUserData,
    chatType : ChatType
    generalGroupData? : GeneralGroupList
}
function useSendMessages({ 
    chatDataSetter, 
    userData, 
    sendMessageToWS, 
    friendData, 
    chatType,
    generalGroupData 
} : useSendMessagesProps){

    const axiosPrivate = useInterceptor()
  const [input, setInput] = useState("");
    const { mutate : sendImageMessageMutation } = useMutation({
        mutationFn : sendImageMessage,
        onSuccess : ({ filename , id })=>{
            if(chatType === "normal"){
                friendData!.type = "normal"
                return sendMessageToWS(friendData!, filename, id, "path");
            }
            generalGroupData!.senderName = userData.fullName;
            generalGroupData!.type = "group"
            return sendMessageToWS(generalGroupData!, filename, id, "path");

        }
    })

    const { mutate : sendTextMessageMutation } = useMutation({
        mutationFn : sendTextMessage,
        onSuccess : ({ id })=>{
            if(chatType === "normal"){
                friendData!.type = "normal"
                return sendMessageToWS(friendData!, input, id ,"content");
            }
            generalGroupData!.type = "group"
            return sendMessageToWS(generalGroupData!, input, id, "content");

        }
    })
  // handles the uploading of image if the image is greater than 1mb an error message is sent to the user
  // else the image is sent to the server to be stored after than the image path/address is sent to the user on the other side
  // connected to the same room
    function handleFileChange(e : React.ChangeEvent<HTMLInputElement>) {
        if(!e.target.files) return
        const image = e.target.files[0];
        if (image.size > 1000000) {
            
            const data = {
                content: "Image should be less than 1MB",
                userId: userData._id,
                time: new Date().toDateString(),
                error: true,
                }
            if(chatType === "group") return chatDataSetter(data, "group", generalGroupData);
            return chatDataSetter(data, "normal");
        }
        const endpoint = chatType === "normal" ? "/user/add-chat-image" : "/user/add-group-chat-image"  
        const imageMessageData = chatType === "normal" ? { friendId: friendData?._id, image } : { groupId: generalGroupData?._id, image }
        sendImageMessageMutation({axiosPrivate, endpoint , imageMessageData })
}

    function onChange(e : React.ChangeEvent<HTMLInputElement>) {
        setInput(e.target.value);
    }

    // if the message is stored successfully in the database the message is sent to the user/s who is/are connected to the same room
    function handleSubmit(e : FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if(input === "") return

        const endpoint = chatType === "normal" ? "/user/chat-data" : "/user/group-data"
        const textMessageData = chatType === "normal" ? { content : input ,friendId: friendData?._id, } : { content : input, groupId : generalGroupData?._id}
        sendTextMessageMutation({ axiosPrivate, endpoint , textMessageData })
        ;(e.target as HTMLFormElement).reset();
      } 
    
    
  
    return {
        handleFileChange,
        handleSubmit,
        onChange
    }
}

export default useSendMessages