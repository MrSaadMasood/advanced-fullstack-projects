import { useQuery } from "@tanstack/react-query"
import { fetchingBasedOnOptionSelected } from "../../api/dataService"
import useInterceptor from "./useInterceptors"
import { useEffect, useState } from "react";
import { AssessoryData, ChatList, ChatType, GeneralGroupList, Message } from "../../Types/dataTypes";

function useOptionsSelected(optionsSelected  : number ) {

    // for storing that chat list data so that if the user selectes another option this data persists and not fetched every time
    const [chatList, setChatList] = useState<ChatList[]>([]);
    const [ groupChatList, setGroupChatList ] = useState<GeneralGroupList[]>([])
    // for storing the friends, request, users, group chat list etc.
    const [ friendsFollowRequestsSentRequestsData, setFriendsFollowRequestsSentRequestsData] = useState<AssessoryData[]>([]);
    console.log(friendsFollowRequestsSentRequestsData, "the data of users from the server is")
    const axiosPrivate = useInterceptor()

    const { data, error } = useQuery({
        queryKey : [optionsSelected],
        queryFn : ()=> fetchingBasedOnOptionSelected(axiosPrivate, optionsSelected)
    })
    const optionsArray = [2,3,5]

    console.log("the data obtained from the server is", data);
     
    useEffect(()=>{
        if(!data) return

        if(optionsSelected === 1){
            setChatList(data)
        }
        if(optionsArray.includes(optionsSelected)){
            setFriendsFollowRequestsSentRequestsData(data)
        }
        if(optionsSelected === 4){
            setGroupChatList(data)
        }
    }, [data])

    // useEffect(()=>{
    //     if(!error) return
    //     if(optionsArray.includes(optionsSelected)){
    //         setFriendsFollowRequestsSentRequestsData([])
    //     }
    // },[ error])
    
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
    function removeFollowRequestAndFriend(id : string) {
        setFriendsFollowRequestsSentRequestsData((prevData) => {
            const updatedArray = prevData.filter(item => {
                return item._id !== id;
            });
            return updatedArray;
        });
    }

    return { 
        chatList, 
        groupChatList, 
        friendsFollowRequestsSentRequestsData,
        chatListArraySetter,
        removeFollowRequestAndFriend
    } 
}

export default useOptionsSelected