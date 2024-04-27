import { ReactNode } from "react"
import { ChatData, FriendData, GeneralGroupList, UserData } from "../Types/dataTypes"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { render, renderHook } from "@testing-library/react"
import { AuthProvider } from "../Components/Context/authProvider"
import { MemoryRouter } from "react-router-dom"
import { GoogleOAuthProvider } from "@react-oauth/google"
import { vi } from "vitest"
import userEvent from "@testing-library/user-event"

const handleChatSearchInputChange = vi.fn()
const openGroupManager = vi.fn()
const selectedChatSetter = vi.fn()
const handleIsFilterClicked = vi.fn() 
const chatDataSetter = vi.fn()
const setGlobalError = vi.fn()
const sendMessageToWS = vi.fn()
const isUserChangedSetter = vi.fn()
const chatFriendImageSetter = vi.fn()
const getChatData = vi.fn()
const user = userEvent.setup()

const factor2AuthLogin = { 
    is2FactorAuthEnabled: true,
    factor2AuthToken : "authToken",
    refreshToken : "refresh",
    isGoogleUser : false
}
const groupMembers = [
    { _id : "1",
        fullName : "test member 1",
        profilePicture : null
    },
    { _id : "2",
        fullName : "test member 2",
        profilePicture : null
    },
    { _id : "3",
        fullName : "test admin 3",
        profilePicture : null
    },
    { _id : "69",
        fullName : "test user",
        profilePicture : null
    }
]
const userData : UserData = {
    collectionId : "userCollection",
    fullName : "test user", 
    profilePicture : null,
    _id : "69",
    bio : "i am a test user",
    email : "tester@gmail.com",
    normalChats : [{ friendId : "1", collectionId : "collection1"}],
    receivedRequests : [],
    sentRequests : [],
    friends : ["4", "5"],
    groupChats : [
        { 
            admins : ["69", "3"],
            members : ["1", "2", "69"],
            collectionId : "groupCollection1",
            groupImage : null,
            groupName : "testGroup",
            id : "100"

        }
    ]
}

const friendData : FriendData = {
    _id : "1",
    profilePicture : null,
    collectionId : "collection1",
    fullName : "test member 1",
    type : "normal"
}

const friend2 = {...friendData, _id : "2", fullName : "test member 2"}
const friend3 = {...friendData, _id : "3", fullName : "test member 3"}

const friendDataArray = [
    friendData,
    friend2,
    friend3
]
const chat1 = {
    time : new Date().toLocaleDateString(),
    userId : "69",
    id : "normalChatRandomId",
    content : "normal chat data",
} 
    
const chat2 = {
    time : new Date().toLocaleDateString(),
    userId : "69",
    id : "errorId",
    error : true,
    content : "normal chat error"
}
const completeChatData : ChatData = {
    _id : "normalChat1",
    chat : [
        chat1, chat2
    ]
}

const groupChatData = [
    { _id : "groupchat1",
        chat : chat1,
        senderName : "test member 1",
    },
    {
        _id : "groupchat2",
        chat : chat2,
        senderName : "test member 2"
    }
]

const generalGroupData : GeneralGroupList = {
    _id : "generalGroupData1",
    groupImage : null,
    groupName : "chat group",
    lastMessage : chat1,
    senderName : "test member 1",
    type : "group"
}

const TestProviderWrappers= ({ children } : { children : ReactNode}) => {
    const queryClient = new QueryClient({
        defaultOptions : {
            queries : {
                retry : false
            }
        }
    })
    return (
        <GoogleOAuthProvider clientId={import.meta.env.VITE_REACT_GOOGLE_CLIENT_ID}>
            <QueryClientProvider client={queryClient}>
                <AuthProvider>
                    <MemoryRouter>
                        {children}
                    </MemoryRouter>
                </AuthProvider>
            </QueryClientProvider>
        </GoogleOAuthProvider>
        
    )
}

const customHooksRender = (hook : Function) => renderHook(() => hook(), { wrapper : TestProviderWrappers})

const customRender = (ui : ReactNode) => render(ui, { wrapper : TestProviderWrappers}) 

export {
    customRender,
    TestProviderWrappers,
    userData,
    groupMembers,
    customHooksRender,
    friendData,
    completeChatData,
    groupChatData,
    generalGroupData,
    handleChatSearchInputChange,
    openGroupManager,
    selectedChatSetter,
    handleIsFilterClicked,
    user,
    chat1,
    factor2AuthLogin,
    friendDataArray,
    chatDataSetter,
    setGlobalError,
    sendMessageToWS,
    isUserChangedSetter,
    chatFriendImageSetter,
    getChatData
} 