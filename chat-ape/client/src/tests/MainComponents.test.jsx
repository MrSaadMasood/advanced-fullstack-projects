import { vi, it, expect } from "vitest"
import { MemoryRouter } from "react-router-dom"
import { render , screen } from "@testing-library/react"
import Users from "../Components/Users"
import { AuthProvider } from "../Components/Context/authProvider"
import userEvent from "@testing-library/user-event"
import SideBar from "../Components/SideBar"
import RightSideBox from "../Components/RightSideBox"
import LeftSideBox from "../Components/LeftSideBox"
import Profile from "../Components/Profile"
import Messages from "../Components/Messages"
import GroupMessagesList from "../Components/GroupMessagesList"
import GroupChat from "../Components/GroupChat"
import Friends from "../Components/Friends"
import FriendRequests from "../Components/FriendRequests"
import ErrorPage from "../Components/ErrorPage"
import ErrorBox from "../Components/ErrorBox"
import DeleteMessage from "../Components/DeleteMessage"
import ChatHeader from "../Components/ChatHeader"
import Chat from "../Components/Chat"

it("tests the Users Component", async ()=>{

    const data = {
        _id : "1",
        fullName : "testName"
    }
    const userData  = {
        sentRequests : ["2","3"]
    }
    const isUserChangedSetter = vi.fn()
    const addToSentRequests = vi.fn()

    render(
        <AuthProvider>
            <Users
                addToSentRequests={addToSentRequests} 
                isUserChangedSetter={isUserChangedSetter}
                data={data}
                userData={userData} 
            />
        </AuthProvider>
    )

    const nameElement = screen.getByText("testName")
    const followButton = screen.getByText("Follow")
    const requestSentButton = screen.queryByText("Request Sent")

    expect(nameElement).toBeInTheDocument()
    expect(followButton).toBeInTheDocument()
    expect(requestSentButton).not.toBeInTheDocument()

    await userEvent.click(followButton)

    expect(isUserChangedSetter).toHaveBeenCalled()
    expect(addToSentRequests).toHaveBeenCalled()
})

it("tests the sideBar component", async ()=>{
    const user = userEvent.setup()

    const setOptions = vi.fn()
    const profilePictureUrl = "someRandomString"

    render(
        <AuthProvider>
            <MemoryRouter>
                <SideBar 
                    setOptions={setOptions} 
                    profilePictureUrl={profilePictureUrl}
                />
            </MemoryRouter>
        </AuthProvider>
    )
    
    const option1 = screen.getByTestId("option1")
    const image = screen.getByTestId("image")

    await user.click(image)
    expect(option1).toBeInTheDocument()
    expect(setOptions).toHaveBeenCalledTimes(1)
    
    await user.click(option1)
    expect(setOptions).toHaveBeenCalledTimes(2)
            
})

it("test the rightSideBoxComponent", async ()=>{
    const user = userEvent.setup()

    const data = {
        time : new Date().toLocaleDateString(),
        content : "test content",
        id : "123"
    }
    const deleteMessage = vi.fn()

    render(
        <AuthProvider>
            <RightSideBox
                sender={"testUser"}
                chatType="normal"
                data={data}
                deleteMessage={deleteMessage}
            />
        </AuthProvider>
    )

    const senderNameElement = screen.getByText("testUser")
    const messageDiv = screen.getByTestId("main")

    await user.dblClick(messageDiv)

    expect(deleteMessage).toHaveBeenCalledTimes(1)
    expect(senderNameElement).toBeInTheDocument()

})

it("test the leftSideBox Component", async ()=>{
    const user = userEvent.setup()

    const data = {
        time : new Date().toLocaleDateString(),
        content : "test content",
        id : "123"
    }

    render(
        <AuthProvider>
            <LeftSideBox
                sender={"testUser"}
                chatType="normal"
                data={data}
            />
        </AuthProvider>
    )

    const senderNameElement = screen.getByText("testUser")
    const contentElemt  = screen.getByText("test content")

    expect(contentElemt).toBeInTheDocument()
    expect(senderNameElement).toBeInTheDocument()

})

it("tests the profile component", async ()=>{
    const user = userEvent.setup()

    const isUserChangedSetter = vi.fn()
    const userData = {
        bio : "test bio",
        profilePicture : "picture.jpg",
        fullName : "greek"
    }
    global.URL.createObjectURL = vi.fn()

    render(
        <AuthProvider>
            <Profile
                profilePictureUrl={"path"} 
                isUserChangedSetter={isUserChangedSetter}
                userData={userData}
            />
        </AuthProvider>
    )

    const fullNameElem = screen.getByText("greek")
    const bioEditButton = screen.getByTestId("bioEdit")
    const imageFile = new File(["hello"], "hello.jpg", { type : "image/jpg"})

    expect(fullNameElem).toBeInTheDocument()
    
    await user.click(bioEditButton)

    const bioSubmit = screen.getByDisplayValue("Submit")
    const textInput = screen.queryByPlaceholderText("Enter Bio Here")
    
    await user.type(textInput, " God of Thunder")
    await user.click(bioSubmit)
    
    const bioElement = screen.getByText("test bio God of Thunder")
    expect(bioElement).toBeInTheDocument()

    // setting and send the profile picture
    const getProfilePictureButton = screen.getByTestId("getPicture")
    const imageInput = screen.getByTestId("profilePicture")

    await user.click(getProfilePictureButton)
    await user.upload(imageInput, imageFile)
    const handleImageSubmission = screen.getByTestId("setImage")
    await user.click(handleImageSubmission)

    expect(isUserChangedSetter).toHaveBeenCalled()
})

it("tests the messages component", async ()=>{
    const user = userEvent.setup()

    const getChatData = vi.fn()
    const chatFriendImageSetter = vi.fn()
    const selectedChatSetter = vi.fn()
    const data = {
        lastMessage : {
            time : new Date().toLocaleDateString(),
            content : "test content"
        },
        friendData : {
            profilePicture : "profile.jpg",
            fullName : "Ultimator"
        }
    }
    global.URL.createObjectURL = vi.fn()
    global.URL.revokeObjectURL = vi.fn()

    render(
        <AuthProvider>
            <Messages
                chatFriendImageSetter={chatFriendImageSetter}
                getChatData={getChatData}
                selectedChatSetter={selectedChatSetter}
                data={data}
            />
        </AuthProvider>
    )

    const fullNameElem = await screen.findByText("Ultimator")
    const messageContent = screen.getByText("test content")
    const dateElemet = screen.getByText(new Date().toLocaleDateString())
    const mainButton = screen.getByTestId("main")

    expect(dateElemet).toBeInTheDocument()
    expect(fullNameElem).toBeInTheDocument()
    expect(messageContent).toBeInTheDocument()

    await user.click(mainButton)
    
    expect(chatFriendImageSetter).toHaveBeenCalled()
    expect(getChatData).toHaveBeenCalled()
    expect(selectedChatSetter).toHaveBeenCalled()
})

it("tests the groupMessageList component", async ()=>{
    const user = userEvent.setup()

    const getChatData = vi.fn()
    const chatFriendImageSetter = vi.fn()
    const selectedChatSetter = vi.fn()
    const data = {
        lastMessage : {
            time : new Date().toLocaleDateString(),
            content : "test content",
            userId : "1"
        },
        groupImage : "group.jpg",
        groupName : "pretender",
        senderName : "ben10"
    }
    const userData = {
        _id : "two"
    }
    global.URL.createObjectURL = vi.fn()
    global.URL.revokeObjectURL = vi.fn()

    render(
        <AuthProvider>
            <GroupMessagesList
                chatFriendImageSetter={chatFriendImageSetter}
                getChatData={getChatData}
                selectedChatSetter={selectedChatSetter}
                data={data}
                userData={userData}
            />
        </AuthProvider>
    )

    const groupName = await screen.findByText("pretender")
    const dateElemet = screen.getByText(new Date().toLocaleDateString())
    const mainButton = screen.getByTestId("main")

    expect(dateElemet).toBeInTheDocument()
    expect(groupName).toBeInTheDocument()

    await user.click(mainButton)
    
    expect(chatFriendImageSetter).toHaveBeenCalled()
    expect(getChatData).toHaveBeenCalled()
    expect(selectedChatSetter).toHaveBeenCalled()
})

it("tests the group chat component", async ()=>{
    const user = userEvent.setup()

    const chatDataSetter = vi.fn()    
    const handleMessageDelete = vi.fn()
    const selectedChatSetter = vi.fn()
    const sendMessageToWS = vi.fn()
    const data = [
        {
            senderName : "tester",
            chat : {
                userId : "one"
            }
        }
    ]
    const groupData = {
        _id : "two",
        senderName : "gwen"
    }
    const groupImage = "groupImage.jpg"
    const userData = {
        _id : "three",
        fullName : "kevin"
    }

    render(
        <AuthProvider>
            <GroupChat
                chatDataSetter={chatDataSetter}
                data={data}
                groupData={groupData}
                groupImage={groupImage}
                handleMessageDelete={handleMessageDelete}
                selectedChatSetter={selectedChatSetter}
                sendMessageToWS={sendMessageToWS}
                userData={userData}
            />
        </AuthProvider>
    )

    const fullNameElem = screen.getByText("tester")
    expect(fullNameElem).toBeInTheDocument()
})

it("tests the friends component", async ()=>{
    const user = userEvent.setup()

    const data = {
        _id : "one",
        fullName : "tester"
    }
    const selectedChatSetter = vi.fn()
    const getChatData = vi.fn()
    const isUserChangedSetter = vi.fn()
    const selectedOptionSetter = vi.fn()
    const removeFriendFromDataArray = vi.fn()

    render(
        <AuthProvider>
            <Friends
                data={data}
                getChatData={getChatData}
                isUserChangedSetter={isUserChangedSetter}
                removeFriendFromDataArray={removeFriendFromDataArray}
                selectedChatSetter={selectedChatSetter}
                selectedOptionSetter={selectedOptionSetter}
            />
        </AuthProvider>
    )

    const fullNameElem = screen.getByText("tester")
    const messageButton = screen.getByText("Message")
    const removeButton = screen.getByText("Remove")

    expect(fullNameElem).toBeInTheDocument()

    await user.click(messageButton)
    await user.click(removeButton)

    expect(getChatData).toHaveBeenCalled()
    expect(isUserChangedSetter).toHaveBeenCalled()
    expect(removeFriendFromDataArray).toHaveBeenCalled()
    expect(selectedOptionSetter).toHaveBeenCalled()
})

it("tests the friends requests component", async ()=>{
    const user = userEvent.setup()

    const isUserChangedSetter = vi.fn()    
    const removeFollowRequest = vi.fn()
    const data = {
        _id : "one",
        fullName : "tester"
    }

    render(
        <AuthProvider>
            <FriendRequests 
                data={data}
                isUserChangedSetter={isUserChangedSetter}
                removeFollowRequest={removeFollowRequest}
            />
        </AuthProvider>
    )

    const fullNameElem = screen.getByText("tester")
    const acceptButton = screen.getByText("Accept")
    const decline = screen.getByText("Decline")

    expect(fullNameElem).toBeInTheDocument()

    await user.click(acceptButton)
    await user.click(decline)

    expect(isUserChangedSetter).toHaveBeenCalled()
    expect(isUserChangedSetter).toHaveBeenCalled()

})

it("tests the ErrorPage component", async ()=>{
    
    render(
        <ErrorPage />
    )

    const errorMessage = screen.getByText("Were sorry, but there seems to be an error.")
    const errorMessage1 = screen.getByText("Oops! Something went wrong")

    expect(errorMessage).toBeInTheDocument()
    expect(errorMessage1).toBeInTheDocument()

})

it("tests the error box component", async ()=>{

    const data = {
        time : new Date().toLocaleDateString(),
        content : "test content"
    }

    render(
        <ErrorBox data={data} />
    )
    
    const dateElement = screen.getByText(new Date().toDateString())
    const contentElemt = screen.getByText("test content")

    expect(dateElement).toBeInTheDocument()
    expect(contentElemt).toBeInTheDocument()
    
})

it("tests the DeleteMessage compoenent", async ()=>{

    const user = userEvent.setup()

    const deleteMessage = vi.fn()
    render(
        <DeleteMessage deleteMessage={deleteMessage} />
    )
    
    const deleteButton = screen.getByText("Delete")
    await user.click(deleteButton)
    expect(deleteMessage).toHaveBeenCalled()

})

it("tests the chat header component", async ()=>{

    const user = userEvent.setup()

    const friendChatImage = "friend.jpg"
    const friendData = {
        fullName : "ben",
        profilePicture : "test.jpg",
        _id : "one",
        groupName : "tester"
    }
    const selectedChatSetter = vi.fn()
    render(
        <ChatHeader 
            friendChatImage={friendChatImage}
            friendData={friendData}
            selectedChatSetter={selectedChatSetter}
        />
    )

    const backButton = screen.getByTestId("back")
    const friendName = screen.getByText("ben")

    expect(friendName).toBeInTheDocument()
    
    await user.click(backButton)

    expect(selectedChatSetter).toHaveBeenCalled()
})


it("tests the chat component", async ()=>{

    const chatDataSetter = vi.fn()    
    const handleMessageDelete = vi.fn()
    const selectedChatSetter = vi.fn()
    const sendMessageToWS = vi.fn()
    const chatData = {
        _id : "six",
        chat : [
        {
            content : "test content",
            id : "one",
            userId : "two",
            time : new Date().toLocaleDateString()
        }
    ]
}
    const friendData = {
        _id : "three",
        fullName : "gwen",
        profilePicture : "friendImage.jpg"
    }
    const friendChatImage = "friendImage.jpg"
    const userData = {
        bio : "bio",
        friends : ["random"],
        fullName : "jax",
        groupChats : [{ id : 1}],
        normalChats : [ { id : 2 } ],
        receivedRequests : ["random2"],
        profilePicture : "picture.jpg",
        sentRequests : ["random3"],
        _id : "seven"
    }

    render(
        <AuthProvider>
            <Chat
                chatData={chatData}
                chatDataSetter={chatDataSetter}
                handleMessageDelete={handleMessageDelete}
                selectedChatSetter={selectedChatSetter}
                sendMessageToWS={sendMessageToWS}
                friendData={friendData}
                friendChatImage={friendChatImage}
                userData={userData}
            />
        </AuthProvider>
    )

    const fullNameElem = screen.getByText("gwen")
    expect(fullNameElem).toBeInTheDocument()
})