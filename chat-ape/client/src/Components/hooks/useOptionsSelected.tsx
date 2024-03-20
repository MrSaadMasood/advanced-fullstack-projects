import { useQuery } from "@tanstack/react-query"
import { fetchingBasedOnOptionSelected } from "../../api/dataService"
import useInterceptor from "./useInterceptors"
import { useEffect, useState } from "react";
import { AssessoryData, ChatList, ChatType, GeneralGroupList, Message } from "../../Types/dataTypes";

function useOptionsSelected(
    optionsSelected  : number,
    handleSearchInputChange : (value : string) =>void
    ) {

    // for storing that chat list data so that if the user selectes another option this data persists and not fetched every time
    const [chatList, setChatList] = useState<ChatList[]>([]);
    const [ groupChatList, setGroupChatList ] = useState<GeneralGroupList[]>([])
    // for storing the friends, request, users, group chat list etc.
    const [ friendsArray , setFriendsArray] = useState<AssessoryData[]>([])
    const [ followRequestsArray , setFollowRequestsArray] = useState<AssessoryData[]>([])
    const [ allUsersArray , setAllUsersArray] = useState<AssessoryData[]>([])
    const axiosPrivate = useInterceptor()

    const { data } = useQuery({
        queryKey : [optionsSelected],
        queryFn : ()=>{
            handleSearchInputChange("")
            return fetchingBasedOnOptionSelected(axiosPrivate, optionsSelected)
        }
    })

     
    useEffect(()=>{
        if(!data) return

        if(optionsSelected === 1){
            setChatList(data)
        }
        if(optionsSelected === 2){
            setFriendsArray(data)
        }
        if(optionsSelected === 3){
            setFollowRequestsArray(data)
        }
        if(optionsSelected === 4){
            setGroupChatList(data)
        }
        if(optionsSelected === 5){
            setAllUsersArray(data)
        }
    }, [data])

    // depending on the type of chat the last message is updated in the list of chats / group chats.
    function chatListArraySetter(id : string , data : Message, chatType : ChatType) {
        if (chatType === "normal") {
            setChatList((prevData) => {
                const modified = prevData.map((item) => {
                    if (item.friendData._id === id) {
                        item.lastMessage = data;
                    }
                    return item;
                });
                return modified;
            });
        }
    
        if (chatType === "group") {
            setGroupChatList((prevData) => {
                const modified = prevData.map(item => {
                    if (item._id === id) {
                        item.lastMessage = data;
                        return item
                    }
                    return item;
                });
                return modified;
            });
        }
    }
    
    // when the friend is added the follow request of that friend is removed from the data
    function removeFollowRequestAndFriend(id : string, type : string) {
        if(type === "friends") {
            setFriendsArray((prevData) => {
                const updatedArray = prevData.filter(item => {
                    return item._id !== id;
                });
                return updatedArray;
            });
        }
        if(type === "followRequests") {
            setFollowRequestsArray((prevData) => {
                const updatedArray = prevData.filter(item => {
                    return item._id !== id;
                });
                return updatedArray;
            });
        }
    }

    return { 
        chatList, 
        groupChatList, 
        friendsArray,
        followRequestsArray,
        allUsersArray,
        chatListArraySetter,
        removeFollowRequestAndFriend
    } 
}

export default useOptionsSelected