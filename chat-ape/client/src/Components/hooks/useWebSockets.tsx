import { useCallback, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client"
import { AcceptedDataOptions, ChatData, ChatType, CommonUserData, GeneralGroupList, GroupChatData, Message, UserData} from "../../Types/dataTypes";
import { generateRoomId } from "../../utils/roomIdGenerator";
import useInterceptor from "./useInterceptors";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {  fetchGroupMembers, filterChat, getGroupChatData, getNormalChatData } from "../../api/dataService";


function useWebSockets(
    chatListArraySetter : (id : string , data : Message, chatType : ChatType) => void,
    handleIsFilterClicked : (value : boolean, type : ChatType)=> void,
    userData : UserData | undefined,
)  {

    const queryClient = useQueryClient()
    // for socket instance
    const [socket, setSocket] = useState<Socket>();
    // to stored the room id
    const [joinedRoom, setJoinedRoom] = useState<string | null>(null);

    const [ areGroupMembersChanged , setAreGroupMembersChanged ] = useState(false)
    // data of the selected friend whom the user is chatting
    const [friendData, setFriendData] = useState<CommonUserData>();
    // the data of the group the user is messaging in
    const [generalGroupData, setGeneralGroupData] = useState<GeneralGroupList>();
    const [ groupMembersData , setGroupMembersData] = useState([])
    const axiosPrivate = useInterceptor()
    const [ chatId , setChatId] = useState("")
    const [ chatType , setChatType] = useState<ChatType>("normal")
    const normalChatDataQueryKey = ["normalChatData", chatType, chatId]
    const groupChatDataQueryKey = ["groupChatData", chatType, chatId]

    const { data : normalChatData = { _id : "", chat: [] }  } = useQuery({
        queryKey : normalChatDataQueryKey,
        queryFn : ()=> getNormalChatData(axiosPrivate, chatId),
        enabled : chatType === "normal" && !!chatId
    })

    const { data : groupChatData = [] } = useQuery({
        queryKey : groupChatDataQueryKey,
        queryFn : ()=> getGroupChatData(axiosPrivate, chatId),
        enabled : chatType === "group" && !!chatId
    })

    const { data : groupMembers} = useQuery({
        queryKey : ["groupMembers", areGroupMembersChanged, groupChatData],
        queryFn : ()=> fetchGroupMembers({ axiosPrivate, id : chatId}),
        enabled :  groupChatData.length > 0 || areGroupMembersChanged
    })

    const { mutate : getFilteredChatMutation } = useMutation({
        mutationFn : filterChat,
        onSuccess : (data)=>{
            if(data.chatType === "normal"){
                return queryClient.setQueryData(normalChatDataQueryKey,
                    { _id : data._id , chat : data.chat} 
                )            
            }
            return queryClient.setQueryData(groupChatDataQueryKey, ()=> [...data.groupChatData])
        }
    })

    useEffect(()=>{ 
        if(groupMembers) setGroupMembersData(groupMembers)
    },[groupMembers])

    useEffect(()=>{
        if(areGroupMembersChanged) setAreGroupMembersChanged(false)
    },[areGroupMembersChanged])

    // create a socket instance when the component renders/ mounts
    useEffect(() => {

        const socket = io(import.meta.env.VITE_REACT_APP_WS_URL, { transports : ["websocket"]})
        setSocket(socket)
        
        // to set the room id so that the other user can connect to the same room
        socket.on("joined-chat", (roomId : string) => {
            setJoinedRoom(roomId);
        });

        // to add the message received from the user in the chat / group chat data simultaneously
        socket.on("received-message", 
            (data : Message, chatType : ChatType, chatId : string, groupChatData : GeneralGroupList) => {

            chatDataSetter(data, chatType, groupChatData, chatId);
            if (chatType === "normal") return chatListArraySetter(data.userId, data, chatType);
            return chatListArraySetter(groupChatData._id, data, chatType);
        });
        
        // to delete the message that other user deleted from this users chat/ group chat
        socket.on("delete-message", (id : string, type : ChatType, chatId : string) => {
            
            removeDeletedMessageFromChat(id, type, chatId);
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    
    // depending upon the type the if the user sends the message to other user the message is updated in the users chat
    // group chats array
    const chatDataSetter = useCallback((
        data : Message, 
        type : ChatType, 
        extraDataForGroupChat? : GeneralGroupList, 
        chatIdFromSocket? : string
    ) => {
        const chatIdToUse = chatIdFromSocket || chatId
        if (type === "normal") {
            queryClient.setQueryData(["normalChatData", type, chatIdToUse],
                (normalChatData : ChatData) => {
                    return { ...normalChatData,
                        chat : [...normalChatData.chat, data]
                    }
                }
             )
        }
        if (type === "group") {
            const dataToAdd : GroupChatData = {
                chat : data,
                senderName : extraDataForGroupChat!.senderName,
                _id : extraDataForGroupChat!._id
            }
            queryClient.setQueryData(["groupChatData", type, chatIdToUse], 
                (groupChatData : GroupChatData[]) => groupChatData.concat(dataToAdd)
                
            )
        }
    }, [chatType, chatId])
    
    // based on the type the speicific message is deleted form the chat array and the id is sent to the sockers 
    // when the same message is removed from the other users chat array
    const removeDeletedMessageFromChat = useCallback((
        messageId : string, 
        type : ChatType, 
        chatIdFromSocket? : string
    ) => {
        const chatIdToUse = chatIdFromSocket || chatId
        if (type === "normal") {
            queryClient.setQueryData(["normalChatData", type, chatIdToUse],
                (normalChatData : ChatData) => {
                    const messageRemovedChatData = normalChatData.chat.filter(message => 
                        message.id !== messageId
                    )
                    return { ...normalChatData, chat : [...messageRemovedChatData]}
                }
             )
        }
        if (type === "group") {
            queryClient.setQueryData(["groupChatData", type, chatIdToUse], 
                (groupChatData : GroupChatData[]) => groupChatData.filter(groupChat =>
                    groupChat.chat.id !== messageId
                ) 
            )
        }
    },[chatType, chatId, normalChatData, groupChatData])
    
    // gets the chat data based on the type and stores that data in tha appropriate state
    // also the room id is generated which is sent to the server so that other users can also connect to that same room id
    const getChatData = useCallback((data : AcceptedDataOptions) => {
        if(!userData) return
        if(!data.type) return
        if(!socket) return console.log("the socket is not found and now returning")
        
        if (data.type === "normal") {
            setChatType("normal")
            const roomId = generateRoomId(userData._id, data._id);
            socket.emit("join-room", joinedRoom, roomId);
            setFriendData(data);
            setChatId(data.collectionId)
        }
    
        if (data.type === "group") {
            setChatType("group")
            const roomId = generateRoomId(data._id, data.groupName);
            socket.emit("join-room", joinedRoom, roomId);
            setChatId(data._id)
            setGeneralGroupData(data);
        }

    },[socket, userData, chatId, chatType, joinedRoom])
    
    const getFilteredChat = useCallback((date : Date, groupMember : string, chatType : ChatType)=> {

        const collectionId = chatType === "normal" ? normalChatData._id : groupChatData[0]._id 

        getFilteredChatMutation({axiosPrivate , chatType, collectionId, date, groupMemberId : groupMember})
        handleIsFilterClicked(false, chatType)

    },[ chatId, normalChatData, groupChatData])

    function handleAreGroupMembersChanged(value : boolean){
        setAreGroupMembersChanged(value)
    }

    return {
        joinedRoom,
        socket,
        normalChatData,
        groupChatData,
        friendData,
        generalGroupData,
        groupMembersData,
        chatId,
        chatDataSetter,
        getFilteredChat,
        removeDeletedMessageFromChat,
        getChatData,
        handleAreGroupMembersChanged,
    }
}

export default useWebSockets
