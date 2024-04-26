import "@testing-library/jest-dom"
import { chatFriendImageSetter, customRender, generalGroupData, getChatData, selectedChatSetter, user, userData } from "../testUtils"
import { screen } from "@testing-library/react"
import { describe, beforeEach, it, expect } from "vitest"
import GroupMessagesList from "../../Components/ListsComponets/GroupMessagesList"

describe('tests the GroupMessageList component', () => { 
    beforeEach(()=>{
        customRender(
            <GroupMessagesList
                chatFriendImageSetter={chatFriendImageSetter}
                getChatData={getChatData}
                selectedChatSetter={selectedChatSetter}
                userData={userData}
                data={generalGroupData}
            />
        )
    })
    it('should render the component successfully', () => { 
        expect(screen.queryByText("Image")).not.toBeInTheDocument()
        expect(screen.getByText("chat group")).toBeInTheDocument()
        expect(screen.getByText(new Date().toLocaleDateString())).toBeInTheDocument()
        expect(screen.getByText(/you/i)).toBeInTheDocument()
    })

    it("should open the group chat", async ()=>{
        const groupMeesageListItem = screen.getByTestId("groupMessageListItem")
        await user.click(groupMeesageListItem)
        expect(getChatData).toHaveBeenCalledTimes(1)
        expect(selectedChatSetter).toHaveBeenCalledTimes(1)
        expect(chatFriendImageSetter).toHaveBeenCalledTimes(1)
    })

 }) 