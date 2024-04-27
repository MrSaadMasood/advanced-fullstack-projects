import "@testing-library/jest-dom"
import { describe, expect, it, vi } from "vitest"
import { customRender, friendDataArray, user } from "../testUtils"
import AddRemoveGroupFriends from "../../Components/MiscComponents/AddRemoveGroupFriends"
import { screen } from "@testing-library/react"

describe("tests the AddorRemoeGroupMember compoenent", ()=>{
    const handleAddRemoveButtonClick = vi.fn()
    
    it("should render the compoenent successfully", ()=>{
        customRender(
            <AddRemoveGroupFriends 
                friendList={friendDataArray}
                friendsIncluded={[]}
                handleAddRemoveButtonClick={handleAddRemoveButtonClick}
            />
        )

        expect(screen.getByText("test member 1")).toBeInTheDocument()
        expect(screen.getByText("test member 2")).toBeInTheDocument()
        expect(screen.queryByText("Remove")).not.toBeInTheDocument()

    })

    it("should add the members and the remove the members from the mebers", async ()=>{
        customRender(
            <AddRemoveGroupFriends 
                friendList={friendDataArray}
                friendsIncluded={["2"]}
                handleAddRemoveButtonClick={handleAddRemoveButtonClick}
            />
        )

        const removeButton = screen.getByText("Remove")
        const addButton = screen.getAllByText("Add")
        
        expect(removeButton).toBeInTheDocument()
        expect(addButton[0]).toBeInTheDocument()

        await user.click(removeButton)
        await user.click(addButton[0])
        
        expect(handleAddRemoveButtonClick).toHaveBeenCalledTimes(2)
    })
})