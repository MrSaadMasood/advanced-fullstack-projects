import "@testing-library/jest-dom"
import { customRender, groupMembers, isUserChangedSetter, setGlobalError, user } from "../testUtils"
import FriendRequests from "../../Components/ListsComponets/FriendRequests"
import { screen } from "@testing-library/react"
import { describe, beforeEach, it, expect } from "vitest"

describe('tests the FriendRequests component', () => { 
    beforeEach(()=>{
        customRender(
            <FriendRequests
                isUserChangedSetter={isUserChangedSetter} 
                setGlobalError={setGlobalError}
                data={groupMembers[0]}
            />
        )
    })
    it('should render the component successfully', () => { 
        expect(screen.getByText("test member 1")).toBeInTheDocument()
        expect(screen.getByText("Accept")).toBeInTheDocument()
    })

    it("should accept the friend Request", async ()=>{
        const acceptButton = screen.getByRole("button", { name : "Accept"})
        await user.click(acceptButton)
        expect(isUserChangedSetter).toHaveBeenCalledTimes(1)
    })

    it("should remove the friend request", async ()=>{

        const removebutton = screen.getByRole("button", { name : "Decline"}) 
        await user.click(removebutton)
        expect(isUserChangedSetter).toHaveBeenCalledTimes(2)
    })
 })