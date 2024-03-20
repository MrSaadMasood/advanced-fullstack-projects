import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client"
import { AcceptedDataOptions, AssessoryData, ChatData, ChatType, CommonUserData, GeneralGroupList, GroupChatData, Message, UserData } from "../../Types/dataTypes";
import { generateRoomId } from "../../utils/roomIdGenerator";
import useInterceptor from "./useInterceptors";
import { useMutation } from "@tanstack/react-query";
import { filterChat } from "../../api/dataService";


function useWebSockets(
    chatListArraySetter : (id : string , data : Message, chatType : ChatType) => void,
    handleIsFilterClicked : (value : boolean, type : ChatType)=> void,
    userData : UserData | undefined,
)  {

    // for socket instance
    const [socket, setSocket] = useState<Socket>();
    // to stored the room id
    const [joinedRoom, setJoinedRoom] = useState<string | null>(null);
    // the selected chat data containing all the messages
    const [completeChatData, setCompleteChatData] = useState<ChatData>({ _id : "", chat: [] });
    // the selected group chat data containing all the messages
    const [groupChatData, setGroupChatData] = useState<GroupChatData[]>([]);
    const [ groupMembers , setGroupMembers ] = useState<AssessoryData[]>([])
    // data of the selected friend whom the user is chatting
    const [friendData, setFriendData] = useState<CommonUserData>();
    // the data of the group the user is messaging in
    const [generalGroupData, setGeneralGroupData] = useState<GeneralGroupList>();

    const axiosPrivate = useInterceptor()

    const { mutate : getFilteredChatMutation } = useMutation({
        mutationFn : filterChat,
        onSuccess : (data)=>{
            console.log("the data obtained from the server is", data)
            if(data.chatType === "normal"){
                return setCompleteChatData({_id : data._id, chat : data.chat})
            }
            setGroupChatData([...data.groupChatData])
        }
    })

    // create a socket instance when the component renders/ mounts
    useEffect(() => {

        const socket = io(import.meta.env.VITE_REACT_APP_SITE_URL)
        setSocket(socket)
        
        // to set the room id so that the other user can connect to the same room
        socket.on("joined-chat", (roomId : string) => {
            setJoinedRoom(roomId);
        });

        // to add the message received from the user in the chat / group chat data simultaneously
        socket.on("received-message", (data : Message, chatType : ChatType, groupChatData : GeneralGroupList) => {

            if (chatType === "normal") {
                chatDataSetter(data, chatType);
                chatListArraySetter(data.userId, data, chatType);
            }

            if (chatType === "group") {
                console.log("the gorup chat data receivd through the web sockt ", groupChatData);
                
                chatDataSetter(data, chatType, groupChatData);
                chatListArraySetter(groupChatData._id, data, chatType);
            }
        });
        
        // to delete the message that other user deleted from this users chat/ group chat
        socket.on("delete-message", (id : string, type : ChatType) => {
            
            removeDeletedMessageFromChat(id, type);
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    
    // depending upon the type the if the user sends the message to other user the message is updated in the users chat
    // group chats array
    function chatDataSetter(data : Message, type : ChatType, extraDataForGroupChat? : GeneralGroupList) {
        if (type === "normal") {
            setCompleteChatData((prevChatData) => {
                const newArray = [...prevChatData.chat, data];
                return {
                    ...prevChatData,
                    chat: newArray
                };
            });
        }
        if (type === "group") {
            const dataToAdd : GroupChatData = {
                chat : data,
                senderName : extraDataForGroupChat!.senderName,
                _id : extraDataForGroupChat!._id
            }
            setGroupChatData((prevData) => {
                const array = [...prevData];
                array.push(dataToAdd);
                return [
                    ...array
                ];
            });
        }
    }
    
    // based on the type the speicific message is deleted form the chat array and the id is sent to the sockers 
    // when the same message is removed from the other users chat array
    function removeDeletedMessageFromChat(messageId : string, type : ChatType) {
        if (type === "normal") {
            setCompleteChatData((prevData) => {
                const arrayAfterDeletion = prevData.chat.filter(item => {
                    return item.id !== messageId;
                });
                return {
                    ...prevData,
                    chat: [...arrayAfterDeletion]
                };
            });
            
        }
        if (type === "group") {
            setGroupChatData((prevData) => {
                const array = prevData.filter(item => {
                    return item.chat.id !== messageId;
                });
                return array;
            });
        }
    }
    
    // gets the chat data based on the type and stores that data in tha appropriate state
    // also the room id is generated which is sent to the server so that other users can also connect to that same room id
    function getChatData(data : AcceptedDataOptions) {
        if(!userData) return
        if(!data.type) return
        if(!socket) return 

        if (data.type === "normal") {
            axiosPrivate.get(`/user/get-chat/${data._id}`).then(res => {
                setCompleteChatData(res.data.chatData);
            }).catch(error => {
                console.log("error occurred while getting the chat", error);
                setCompleteChatData({ _id : "", chat: [] });
            });
    
            const roomId = generateRoomId(userData._id, data._id);
            socket.emit("join-room", joinedRoom, roomId);
            setFriendData(data);
        }
    
        if (data.type === "group") {
            axiosPrivate.get(`/user/get-group-chat/${data._id}`).then(res => {
                setGroupChatData(res.data.groupChatData);
            }).catch(error => {
                console.log("error occurred while getting the group chat data", error);
                setGroupChatData([]);
            });

            axiosPrivate.post("/user/group-members", { collectionId : data._id}).then(res=>{
                res.data.push({ _id : "", fullName : "None" })
                setGroupMembers(res.data)
            }).catch(error=> console.log(error))
    
            const roomId = generateRoomId(data._id, data.groupName);
            socket.emit("join-room", joinedRoom, roomId);
    
            setGeneralGroupData(data);
        }
    }
    
    function getFilteredChat(date : Date, groupMember : string, chatType : ChatType){
        const collectionId = chatType === "normal" ? completeChatData._id : groupChatData[0]._id 
        getFilteredChatMutation({axiosPrivate , chatType, collectionId, date, groupMemberId : groupMember})
        handleIsFilterClicked(false, chatType)
    }
    return {
        joinedRoom,
        socket,
        completeChatData,
        groupChatData,
        friendData,
        generalGroupData,
        groupMembers,
        chatDataSetter,
        getFilteredChat,
        removeDeletedMessageFromChat,
        getChatData
    }
}

export default useWebSockets