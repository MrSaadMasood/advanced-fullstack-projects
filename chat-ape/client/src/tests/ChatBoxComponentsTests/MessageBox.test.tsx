import "@testing-library/jest-dom"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { completeChatData, customRender, user } from "../testUtils"
import MessageBox from "../../Components/ChatBoxComponets/MessageBox"
import { screen } from "@testing-library/react"

const deleteMessage = vi.fn()
describe("tests the message box compoenent", () =>{
    beforeEach(()=>{
        customRender(
            <MessageBox
                boxSide="right"
                chatType="normal"
                data={completeChatData.chat[0]}
                deleteMessage={deleteMessage}
                sender="test sender"
            />
        )
    })
    it("should render the message box", ()=>{
        
        expect(screen.getByText("test sender")).toBeInTheDocument()
        expect(screen.getByText("normal chat data")).toBeInTheDocument()
    })

    it("should open the delete message div", async ()=>{
        const messageBox = screen.getByTestId("messageBox") 
        await user.dblClick(messageBox)
        expect(deleteMessage).toHaveBeenCalled()
    })
})

describe("test the funcationlity of left side text box", ()=>{

    it("should now open the delete message box", async ()=>{
        customRender(
            <MessageBox
                boxSide="left"
                chatType="normal"
                data={completeChatData.chat[0]}
                deleteMessage={deleteMessage}
                sender="test sender"
            />
        )
        const messageBox = screen.getByTestId("messageBox") 
        await user.dblClick(messageBox)
        expect(deleteMessage).not.toHaveBeenCalledTimes(2)

    })
})