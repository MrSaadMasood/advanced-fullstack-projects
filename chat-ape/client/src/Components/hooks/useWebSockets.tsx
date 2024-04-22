import { useCallback, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client"
import { AcceptedDataOptions, AssessoryData, ChatData, ChatType, CommonUserData, GeneralGroupList, GroupChatData, Message, UserData} from "../../Types/dataTypes";
import { generateRoomId } from "../../utils/roomIdGenerator";
import useInterceptor from "./useInterceptors";
import { useMutation, useQuery } from "@tanstack/react-query";
import { fetChatDataBasedOnType, fetchGroupMembers, filterChat } from "../../api/dataService";


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
    const [ areGroupMembersChanged , setAreGroupMembersChanged ] = useState(false)
    // data of the selected friend whom the user is chatting
    const [friendData, setFriendData] = useState<CommonUserData>();
    // the data of the group the user is messaging in
    const [generalGroupData, setGeneralGroupData] = useState<GeneralGroupList>();

    const axiosPrivate = useInterceptor()
    // const [ isMoreChatRequested , setIsMoreChatRequested] = useState(false)
    const [ docsSkipCount , setDocsSkipCount] = useState(10)
    const [ chatId , setChatId] = useState("")
    const [ chatType , setChatType] = useState<ChatType>("normal")

    const { data } = useQuery({
        queryKey : [chatId],
        queryFn :  ()=> fetChatDataBasedOnType({axiosPrivate, chatId, chatType, docsSkipCount }),
        enabled : !!chatId
    })
    
    const { data : groupMambersData } = useQuery({
        queryKey : ["groupMembers", data, areGroupMembersChanged],
        queryFn : ()=> fetchGroupMembers({ axiosPrivate, id : chatId}),
        enabled : !!data || areGroupMembersChanged
    })
    const { mutate : getFilteredChatMutation } = useMutation({
        mutationFn : filterChat,
        onSuccess : (data)=>{
            if(data.chatType === "normal"){
                return setCompleteChatData({_id : data._id, chat : data.chat})
            }
            setGroupChatData([...data.groupChatData])
        }
    })

    useEffect(()=>{
        if(areGroupMembersChanged) setAreGroupMembersChanged(false)
    },[areGroupMembersChanged])

    // useEffect(()=>{
    //     if(isMoreChatRequested) setIsMoreChatRequested(false)
    // }, [isMoreChatRequested])

    useEffect(()=>{
        
        if(!data) return
        // setDocsSkipCount((docsSkipCount)=> docsSkipCount + 10)
        console.log("the chat data from the server is", data)
        if(chatType === "normal") {
            return setCompleteChatData(data)
            // return setCompleteChatData((prevData)=>{
            // const chatArray = [...data.chat ,...prevData.chat]
            // return {
            //     ...prevData,
            //     chat : chatArray
            // }
        // })
        }
    
        setGroupChatData((prevData)=>{
            return [...data , ...prevData]
        })

     },[data, chatType])

     useEffect(()=>{
        if(groupMambersData) setGroupMembers(groupMambersData)
        console.log("group members are now fetched", groupMambersData)
     },[groupMambersData])

    // create a socket instance when the component renders/ mounts
    useEffect(() => {

        const socket = io(import.meta.env.VITE_REACT_APP_SITE_URL, { transports : ["websocket"]})
        setSocket(socket)
        
        // to set the room id so that the other user can connect to the same room
        socket.on("joined-chat", (roomId : string) => {
            setJoinedRoom(roomId);
        });

        // to add the message received from the user in the chat / group chat data simultaneously
        socket.on("received-message", (data : Message, chatType : ChatType, groupChatData : GeneralGroupList) => {

            if (chatType === "normal") {
                console.log('nomral message received from sockers', data)
                chatDataSetter(data, chatType);
                chatListArraySetter(data.userId, data, chatType);
            }

            if (chatType === "group") {
                
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
    const chatDataSetter = useCallback((data : Message, type : ChatType, extraDataForGroupChat? : GeneralGroupList) => {
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
    },[])
    
    // based on the type the speicific message is deleted form the chat array and the id is sent to the sockers 
    // when the same message is removed from the other users chat array
    const removeDeletedMessageFromChat = useCallback((messageId : string, type : ChatType) => {
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
    },[])
    
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

        if(data._id !== chatId){
            setDocsSkipCount(10)
        }
    },[socket, userData, chatId, joinedRoom])
    
    const getFilteredChat = useCallback((date : Date, groupMember : string, chatType : ChatType)=> {

        const collectionId = chatType === "normal" ? completeChatData._id : groupChatData[0]._id 

        getFilteredChatMutation({axiosPrivate , chatType, collectionId, date, groupMemberId : groupMember})
        handleIsFilterClicked(false, chatType)

    },[])

    function handleAreGroupMembersChanged(value : boolean){
        setAreGroupMembersChanged(value)
    }
    // const handleIsMoreChatRequested = useCallback((value : boolean) =>{
    //     setIsMoreChatRequested(value)
    // },[])

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
        getChatData,
        // handleIsMoreChatRequested,
        handleAreGroupMembersChanged,
    }
}

export default useWebSockets