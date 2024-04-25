import "@testing-library/jest-dom"
import { beforeAll, describe, expect, it, vi } from "vitest"
import { completeChatData, customRender, friendData, generalGroupData, groupChatData, handleChatSearchInputChange, handleIsFilterClicked, openGroupManager, selectedChatSetter, userData } from "../testUtils"
import Chat from "../../Components/ChatBoxComponets/Chat"
import { screen } from "@testing-library/react"
import GroupChat from "../../Components/ChatBoxComponets/GroupChat"

const sendMessageToWS = vi.fn()
const chatDataSetter = vi.fn()
const handleMessageDelete = vi.fn()
const setGlobalError = vi.fn()

describe('tests the Chat component ', () => { 
    beforeAll(()=>{ 
        customRender(
            <Chat
                chatDataSetter={chatDataSetter}
                chatSearchInput=""
                completeChatData={completeChatData}
                friendChatImage=""
                friendData={friendData}
                handleChatSearchInputChange={handleChatSearchInputChange}
                handleIsFilterClicked={handleIsFilterClicked} 
                handleMessageDelete={handleMessageDelete}
                openGroupManager={openGroupManager}
                selectedChatSetter={selectedChatSetter}
                sendMessageToWS={sendMessageToWS}
                setGlobalError={setGlobalError}
                userData={userData}
            />
        )
    })
        
    it("should render all the normalChatData", ()=>{
        
        expect(screen.getByText("test member 1")).toBeInTheDocument()
        expect(screen.getByText("normal chat data")).toBeInTheDocument()
        expect(screen.getByText("normal chat error")).toBeInTheDocument()
        expect(screen.getByTestId("submit")).toBeInTheDocument()

    })
})

describe('tests the group chat component', () => { 
    
    beforeAll(()=> {
        customRender(
            <GroupChat 
                chatDataSetter={chatDataSetter}
                chatSearchInput=""
                data={groupChatData}
                generalGroupData={generalGroupData}
                groupImage=""
                handleChatSearchInputChange={handleChatSearchInputChange}
                handleIsFilterClicked={handleIsFilterClicked} 
                handleMessageDelete={handleMessageDelete}
                openGroupManager={openGroupManager}
                selectedChatSetter={selectedChatSetter}
                sendMessageToWS={sendMessageToWS}
                setGlobalError={setGlobalError}
                userData={userData}
            />
        )
    })
    it('should render the group chat compoenent', () => { 
        expect(screen.getByText("chat group")).toBeInTheDocument()
        expect(screen.getByText("normal chat data")).toBeInTheDocument()
        expect(screen.getByText("normal chat error")).toBeInTheDocument()
     })
 })