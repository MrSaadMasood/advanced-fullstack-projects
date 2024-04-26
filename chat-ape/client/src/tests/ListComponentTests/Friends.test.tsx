import "@testing-library/jest-dom"
import { customRender, friendData, isUserChangedSetter, setGlobalError, user } from "../testUtils"
import { screen, waitFor } from "@testing-library/react"
import { describe, beforeEach, it, expect, vi } from "vitest"
import Friends from "../../Components/ListsComponets/Friends"

describe('tests the Friends component', () => { 
    const selectedChatSetter = vi.fn()
    const selectedOptionSetter = vi.fn()
    const getChatData = vi.fn()
    beforeEach(()=>{
        customRender(
            <Friends
                getChatData={getChatData} 
                data={friendData}
                isUserChangedSetter={isUserChangedSetter}
                selectedChatSetter={selectedChatSetter}
                selectedOptionSetter={selectedOptionSetter}
                setGlobalError={setGlobalError}
            />
        )
    })
    it('should render the component successfully', () => { 
        expect(screen.getByText("test member 1")).toBeInTheDocument()
        expect(screen.getByText("Message")).toBeInTheDocument()
    })

    it("should open the chat of that friend", async ()=>{
        const messageButton = screen.getByRole("button", { name : "Message"})
        await user.click(messageButton)
        expect(selectedOptionSetter).toHaveBeenCalledTimes(1)
        expect(selectedChatSetter).toHaveBeenCalledTimes(1)
    })

    it("should unfriend the added friend", async ()=>{
        await waitFor( async () => {
            const removebutton = screen.getByRole("button", { name : "Remove"}) 
            await user.click(removebutton)
            expect(setGlobalError).not.toHaveBeenCalledTimes(1)
        })
    })
 })