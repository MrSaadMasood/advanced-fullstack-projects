import { CiCirclePlus } from "react-icons/ci";

import { useEffect, useState } from "react";
import useInterceptor from "./hooks/useInterceptors";
import { Link } from "react-router-dom";

import SideBar from "./MiscComponents/SideBar";
import Chat from "./ChatBoxComponets/Chat";
import FriendRequests from "./ListsComponets/FriendRequests";
import Users from "./ListsComponets/Users";
import Friends from "./ListsComponets/Friends";
import Profile from "./AuthComponents/Profile";
import GroupMessagesList from "./ListsComponets/GroupMessagesList";
import GroupChat from "./ChatBoxComponets/GroupChat";
import DeleteMessage from "./MiscComponents/DeleteMessage";
import NormalMessagesList from "./ListsComponets/NormalMessageList";
import { 
    AcceptedDataOptions, 
    AssessoryData, 
    ChatData, 
    ChatList, 
    ChatType, 
    ContentOrImagePath,
    GeneralGroupList,
    GroupChatData,
    MessageToDelete, 
    UserData } from "../Types/dataTypes";
import useOptionsSelected from "./hooks/useOptionsSelected";
import useWebSockets from "./hooks/useWebSockets";
import { useMutation, useQuery } from "@tanstack/react-query";
import { deleteMessageFromChat, fetchPictureFromServer, fetchUserData } from "../api/dataService";
import SideListsHeader from "./ListsComponets/SideListsHeader";
import getFilteredData, { filterChatData } from "../utils/filterArrayFunction";
import useSearch from "./hooks/useSearch";
import FilterOptions from "./MiscComponents/FilterOptions";


export default function Home() {
    // based on the option the specific data is fetched and shown
    const [optionsSelected, setOptionsSelected] = useState(1);
    const [headerText, setHeaderText] = useState("Chats");
    // the selected chat type is used to dispalay various components 
    const [selectedChat, setSelectedChat] = useState("");
    const [userData, setUserData] = useState<UserData>();
    const [ isSearchTriggered , setIsSearchTriggered ] = useState(false)
    const { 
        searchInput, 
        chatSearchInput, 
        filterOptions,
        handleSearchInputChange, 
        handleChatSearchInputChange,
        handleIsFilterClicked
    } = useSearch()

    const { 
        chatList, 
        groupChatList, 
        friendsArray,
        followRequestsArray,
        allUsersArray,
        removeFollowRequestAndFriend,
        chatListArraySetter 
    } = useOptionsSelected(optionsSelected, handleSearchInputChange)

    const { 
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
    } = useWebSockets(chatListArraySetter,handleIsFilterClicked, userData)

    // console.log("the filterd chat list is", searchInput, filteredChatList)
    // basically used if the auth tokens are refershed then the user data is fetched again. Also when the database is updated with 
    // some data and userData needs to be updated with that data
    const [isUserChanged, setIsUserChanged] = useState(false);
    // user profile picture url
    const [profilePictureUrl, setProfilePictureUrl] = useState("/placeholder.png");
    // friend profile picture
    const [friendChatImage, setFriendChatImage] = useState("/placeholder.png");
    // to store the message to be deleted
    const [messageToDeleteInfo, setMessageToDeleteInfo] = useState<MessageToDelete>();
    const [showDeleteMessageOptions, setShowDeletMessageOption] = useState(false);
    const axiosPrivate = useInterceptor();

    const { data : userDataFromServer } = useQuery({
        queryKey : [userData, isUserChanged],
        queryFn : ()=> fetchUserData(axiosPrivate),
        enabled : !userData || isUserChanged
    })
    
    const { mutate : deleteMessageMutation } = useMutation({
        mutationFn : deleteMessageFromChat,
        onSuccess : ()=>{
            if(!messageToDeleteInfo) return
            if(!socket) return
            socket.emit("delete-message", joinedRoom, messageToDeleteInfo.messageId, messageToDeleteInfo.type);
            removeDeletedMessageFromChat(messageToDeleteInfo.messageId, messageToDeleteInfo.type);
            setShowDeletMessageOption(false);
        }

    })
    
    const display = selectedChat ? "hidden" : "";

    const filteredChatList =  optionsSelected === 1 ? 
        getFilteredData(chatList, optionsSelected, searchInput) as ChatList[] : 
        chatList 

    const filteredGroupChatList = optionsSelected === 4 ? 
        getFilteredData(groupChatList, optionsSelected, searchInput) as GeneralGroupList[] : 
        groupChatList

    const filteredFriendsList = optionsSelected === 2 ? 
        getFilteredData(friendsArray, optionsSelected, searchInput) as AssessoryData[] : 
        friendsArray

    const filteredFollowRequests = optionsSelected === 3 ? 
        getFilteredData(followRequestsArray, optionsSelected, searchInput) as AssessoryData[] : 
        followRequestsArray

    const filteredUsers = optionsSelected === 5 ? 
        getFilteredData(allUsersArray, optionsSelected, searchInput) as AssessoryData[] : 
        allUsersArray

    const filteredNormalChats = completeChatData.chat.length === 0 ? 
        completeChatData :  
        filterChatData(completeChatData, "normal", chatSearchInput) as ChatData
    
    const filteredGroupChat = groupChatData.length === 0 ?
        groupChatData :
        filterChatData(groupChatData, "group", chatSearchInput) as GroupChatData[]

    // on component mount the userData is fetched from the server
    // if the user data contains the profile picture the
    // blob is fetched and then converted to url that is displayed.
    useEffect(()=>{
        if(!userDataFromServer) return

        const { isGoogleUser, profilePicture} = userDataFromServer
        setUserData( userDataFromServer)
        if(userDataFromServer.profilePicture){
            if(isGoogleUser && profilePicture.startsWith("https")) return setProfilePictureUrl(profilePicture) 
            ;(async ()=>{
                const pictureUrl = await fetchPictureFromServer(
                    axiosPrivate, `/user/get-profile-picture/${userDataFromServer.profilePicture}`
                    )
                if(!pictureUrl) return 
                setProfilePictureUrl(pictureUrl);
                return () => URL.revokeObjectURL(pictureUrl);
            })()
        }

    },[ userDataFromServer])

    useEffect(()=>{
        if(isUserChanged) setIsUserChanged(false)
    },[isUserChanged])

    // this adds the user that is sent the request to the sent reques array and that user is shown as "request sent". so no
    // further request are made
    function addToSentRequests(id : string) {
        
        setUserData((prevData) => {
            if(!prevData) return undefined
            prevData.sentRequests.push(id);
            return { ...prevData };
        });
    }

    // to set the type of chat and based on that normal chat or group chats component is rendered
    function selectedChatSetter(chat : string) {
        setSelectedChat(chat);
    }

    // sets the option selected and also the header text based on the option
    function selectedOptionSetter(option : number, text : string) {
        setOptionsSelected(option);
        setHeaderText(text);
    }

    // sets if the user data is changed and based on that a fetch request is made
    function isUserChangedSetter(value : boolean) {
        setIsUserChanged(value);
    }
    // depending on the chat types specific data is sent to the sockets.
    function sendMessageToWS(
        sentData : AcceptedDataOptions, 
        content : string, 
        contentId : string, 
        type : ContentOrImagePath) {

        if(!userData) return
        if(!socket) return

        const chatType = sentData.type
        const data = {
            [type]: content,
            id: contentId,
            time: new Date().toDateString(),
            userId: userData._id
        };
    
        if (chatType === "normal") {
            chatDataSetter(data, chatType);
            chatListArraySetter(sentData._id, data, chatType);
            socket.emit("send-message", joinedRoom, data, chatType, "useless");
        }
    
        if (chatType === "group") {
        
            chatDataSetter(data, chatType, sentData);
            sentData.lastMessage = data;
            chatListArraySetter(sentData._id, data, chatType);
            socket.emit("send-message", joinedRoom, data, chatType, sentData);
        }
    }
    // to set the image of the selected friend to chat
    function chatFriendImageSetter(url : string) {
        setFriendChatImage(url);
    }
    
    // handles the deletion of message message stored the message to delete data in state
    function handleMessageDelete(messageId : string, type : ChatType) {
        setMessageToDeleteInfo({
            collectionId: type === "normal" ? completeChatData._id : groupChatData[0]._id,
            type: type,
            messageId
        });
        setShowDeletMessageOption(true);
    }
    
    // to delete the selected from the database and subsequntly from the chat array
    function deleteMessage() {
        if(!messageToDeleteInfo) return 
        deleteMessageMutation({axiosPrivate, messageToDeleteInfo})
    }

    function handleMessageDeleteCancellation(){
       setMessageToDeleteInfo(undefined) 
       setShowDeletMessageOption(false)
    }


    return (
        <div>
            {showDeleteMessageOptions &&
                <DeleteMessage deleteMessage={deleteMessage} handleMessageDeleteCancellation={handleMessageDeleteCancellation} />
            }
            {filterOptions.filterClicked  && 
                <FilterOptions 
                    filterOptions={filterOptions} 
                    groupMembers={groupMembers}
                    handleIsFilterClicked={handleIsFilterClicked}
                    getFilteredChat={getFilteredChat}
                />
            }
            <div className="lg:flex">
                <SideBar
                    setOptions={selectedOptionSetter}
                    profilePictureUrl={profilePictureUrl}
                />
    
                {optionsSelected === 6 && userData &&
                    <Profile
                        userData={userData}
                        profilePictureUrl={profilePictureUrl}
                        isUserChangedSetter={isUserChangedSetter}
                    />
                }
                {optionsSelected !== 6 &&
                    <div className={`${display} lg:inline h-screen w-full lg:ml-16 lg:w-[23rem]  bg-black lg:border-r-2
                        lg:border-[#555555] text-white`}>
                        <SideListsHeader
                            searchInput={searchInput}
                            handleSearchInputChange={handleSearchInputChange}
                            headerText={headerText}
                            isSearchTriggered={isSearchTriggered} 
                            setIsSearchTriggered={setIsSearchTriggered}
                        />
                        <div className="bg-[#1b1b1b] w-full lg:w-[22rem] h-[87vh] overflow-y-scroll noScroll">
                                {optionsSelected === 4 && userData &&
                                    <Link 
                                        to={"/create-new-group"} 
                                        state={{ friends: userData.friends }} 
                                        className="hover:scale-105 h-[3rem] bg-[#494949] hover:bg-[#404040]
                                         border-black border-2 w-full flex justify-center items-center"
                                    >
                                        <button data-testid="newGroup">
                                            <CiCirclePlus size={30} />
                                        </button>
                                    </Link>
                                }
                            {optionsSelected === 1 && filteredChatList.map((chat, index) => {
                                    return (
                                        <NormalMessagesList
                                            key={index}
                                            data={chat}
                                            selectedChatSetter={selectedChatSetter}
                                            getChatData={getChatData}
                                            chatFriendImageSetter={chatFriendImageSetter}
                                        />
                                    )
                            })}
                            {optionsSelected === 4 && userData && filteredGroupChatList.map((groupChat, index)=>{
                                return (
                                    <GroupMessagesList
                                        chatFriendImageSetter={chatFriendImageSetter}
                                        getChatData={getChatData}
                                        key={index}
                                        data={groupChat}
                                        selectedChatSetter={selectedChatSetter}
                                        userData={userData}
                                    />
                                )
                            })}
                            {optionsSelected === 2 && filteredFriendsList.map((data, index)=>{
                                    return (
                                        <Friends
                                            key={index}
                                            data={data}
                                            selectedChatSetter={selectedChatSetter}
                                            selectedOptionSetter={selectedOptionSetter}
                                            isUserChangedSetter={isUserChangedSetter}
                                            removeFriendFromDataArray={removeFollowRequestAndFriend}
                                            getChatData={getChatData}
                                        />
                            )})}
                            {optionsSelected === 3 && filteredFollowRequests.map((data, index)=>{
                                    return (
                                        <FriendRequests
                                            key={index}
                                            data={data}
                                            isUserChangedSetter={isUserChangedSetter}
                                            removeFollowRequest={removeFollowRequestAndFriend}
                                        />
                            )})}
                            {optionsSelected === 5 && userData && filteredUsers.map((data, index) => {
                                if (userData._id !== data._id && userData.friends.includes(data._id) === false) {
                                    return (
                                        <Users
                                            key={index}
                                            data={data}
                                            userData={userData}
                                            addToSentRequests={addToSentRequests}
                                            isUserChangedSetter={isUserChangedSetter}
                                        />
                                    );
                                }
                            })}
                        </div>
                    </div>
                }
    
                {optionsSelected !== 6 && selectedChat === "normal" && friendData && userData &&
                    <Chat
                        selectedChatSetter={selectedChatSetter}
                        completeChatData={filteredNormalChats}
                        friendData={friendData}
                        userData={userData}
                        sendMessageToWS={sendMessageToWS}
                        chatDataSetter={chatDataSetter}
                        friendChatImage={friendChatImage}
                        handleMessageDelete={handleMessageDelete}
                        handleChatSearchInputChange={handleChatSearchInputChange}
                        chatSearchInput={chatSearchInput} 
                        handleIsFilterClicked={handleIsFilterClicked}
                        // filterOptions={isFilterClicked}
                    />}
                {optionsSelected !== 6 && selectedChat === "group" && generalGroupData && userData &&
                    <GroupChat
                        userData={userData}
                        data={filteredGroupChat}
                        groupImage={friendChatImage}
                        selectedChatSetter={selectedChatSetter}
                        generalGroupData={generalGroupData}
                        chatDataSetter={chatDataSetter}
                        sendMessageToWS={sendMessageToWS}
                        handleMessageDelete={handleMessageDelete}
                        handleChatSearchInputChange={handleChatSearchInputChange}
                        chatSearchInput={chatSearchInput} 
                        handleIsFilterClicked={handleIsFilterClicked}
                        // filterOptions={isFilterClicked}
                    />}
                {optionsSelected !== 6 && selectedChat === "" &&
                    <div className="hidden bg-black h-screen w-full lg:flex justify-center items-center text-white text-2xl">
                        <p>
                            No Chat Selected
                        </p>
                    </div>
                }
            </div>
        </div>
    )
}