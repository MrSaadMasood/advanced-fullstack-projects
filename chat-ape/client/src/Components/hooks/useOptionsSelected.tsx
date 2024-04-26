import { useQuery, useQueryClient } from "@tanstack/react-query"
import useInterceptor from "./useInterceptors"
import { useCallback } from "react";
import { AssessoryData, ChatList, ChatType, FriendData, GeneralGroupList, Message } from "../../Types/dataTypes";
import { getFollowRequestsList, getFriendsList, getGroupChatList, getNormalChatList, getUsersList } from "../../api/dataService";

function useOptionsSelected(
    optionsSelected?  : number,
    ) {

    const axiosPrivate = useInterceptor()
    const queryClient = useQueryClient()
    const { data : chatList = [] } = useQuery({
        queryKey : ["normalChatList", optionsSelected],
        queryFn : ()=> getNormalChatList(axiosPrivate),
        enabled : optionsSelected === 1
    })
    
    const { data : friendsArray = [] } = useQuery({
        queryKey : ["friendsList", optionsSelected],
        queryFn : ()=> getFriendsList(axiosPrivate),
        enabled : optionsSelected === 2
    })

    const { data : followRequestsArray = [] } = useQuery({
        queryKey : ["followRequestsList", optionsSelected],
        queryFn : ()=> getFollowRequestsList(axiosPrivate),
        enabled : optionsSelected === 3
    })

    const { data : groupChatList = [] } = useQuery({
        queryKey : ["groupChatList", optionsSelected],
        queryFn : ()=> getGroupChatList(axiosPrivate),
        enabled : optionsSelected === 4
    })
    const { data : allUsersArray = [] } = useQuery({
        queryKey : ["usersList", optionsSelected],
        queryFn : ()=> getUsersList(axiosPrivate),
        enabled : optionsSelected === 5
    })
     
    // depending on the type of chat the last message is updated in the list of chats / group chats.
    const chatListArraySetter = useCallback((id : string , data : Message, chatType : ChatType) => {
        if (chatType === "normal") {
            queryClient.setQueryData(["normalChatList", optionsSelected], (oldNormalChatList : ChatList[])=>{
                return oldNormalChatList.map(normalChat => {
                    if(normalChat.friendData._id === id) normalChat.lastMessage = data
                    return normalChat
                } )
            })
        }
    
        if (chatType === "group") {
            queryClient.setQueryData(["groupChatList", optionsSelected], (oldGroupChatList : GeneralGroupList[])=>{
                return oldGroupChatList.map(groupChat => {
                    if(groupChat._id === id) groupChat.lastMessage = data
                    return groupChat
                })
            })
        }
    },[optionsSelected])
    
    // when the friend is added the follow request of that friend is removed from the data
    const removeFollowRequestAndFriend = useCallback((id : string, type : string) => {
        if(type === "friends") {
            const queryKey = ["friendsList", optionsSelected] 
            queryClient.setQueryData(queryKey, (oldFriendList : FriendData[]) => {
                return oldFriendList.filter(item => item._id !== id);
            })
        }
        if(type === "followRequests") {
            queryClient.setQueryData(["followRequestsList", optionsSelected], (oldFollowRequests : AssessoryData[])=>{
                return oldFollowRequests.filter(requests => requests._id !== id)
            })
        }
    }, [optionsSelected])

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