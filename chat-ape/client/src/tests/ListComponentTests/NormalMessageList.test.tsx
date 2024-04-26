import "@testing-library/jest-dom"
import { chat1, chatFriendImageSetter, customRender, friendData, getChatData, selectedChatSetter, user } from "../testUtils"
import { screen } from "@testing-library/react"
import { describe, beforeEach, it, expect } from "vitest"
import NormalMessagesList from "../../Components/ListsComponets/NormalMessageList"

describe('tests the NormalMessageList component', () => { 
    const  data = { 
        _id : "normalMessageListId",
        lastMessage : chat1,
        friendData
    }

    beforeEach(()=>{
        customRender(
            <NormalMessagesList
                chatFriendImageSetter={chatFriendImageSetter}
                getChatData={getChatData}
                selectedChatSetter={selectedChatSetter}
                data={data}
            />
        )
    })
    it('should render the component successfully', () => { 
        expect(screen.queryByText("Image")).not.toBeInTheDocument()
        expect(screen.getByText("normal chat data")).toBeInTheDocument()
        expect(screen.getByText(new Date().toLocaleDateString())).toBeInTheDocument()
        expect(screen.getByText("test member 1")).toBeInTheDocument()
    })

    it("should open the chat with the friend", async ()=>{
        const normalMeesageListItem = screen.getByTestId("normalMessageListItem")
        await user.click(normalMeesageListItem)
        expect(getChatData).toHaveBeenCalledTimes(1)
        expect(selectedChatSetter).toHaveBeenCalledTimes(1)
        expect(chatFriendImageSetter).toHaveBeenCalledTimes(1)
    })

 }) 