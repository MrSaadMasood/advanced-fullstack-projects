import { screen } from "@testing-library/react";
import "@testing-library/jest-dom"
import { beforeEach, describe, expect, it, vi } from "vitest";
import GroupManager from "../../Components/AuthComponents/GroupManager";
import userEvent from "@testing-library/user-event";
import { customRender, groupMembers, userData } from "../testUtils";

describe("tests the groupManagerComponent", ()=>{
    const groupId = "groupCollection1"
    const openGroupManager = vi.fn()
    const setGlobalError = vi.fn()
    const handleAreGroupMembersChanged = vi.fn()
    const changeUserDataBasedOnGroupChanges = vi.fn()

    beforeEach(()=>{

        customRender(
            <GroupManager 
                changeUserDataBasedOnGroupChanges={changeUserDataBasedOnGroupChanges}
                groupId={groupId}
                groupMembers={groupMembers}
                handleAreGroupMembersChanged={handleAreGroupMembersChanged}
                openGroupManager={openGroupManager}
                setGlobalError={setGlobalError}
                userData={userData}
            />
        )
    })

    it("should render the groupName", ()=>{

        expect(screen.getByRole("heading", { name : "testGroup"})).toBeInTheDocument()
        expect(screen.getByText("testGroup")).toBeInTheDocument()
})

    it("should show the admins of the group", async ()=>{

        const adminButton = screen.getByRole("button", { name : "Admins"})
        await userEvent.click(adminButton)
        expect(screen.getByText("test user")).toBeInTheDocument()
    })

    it("should show the friends other than the members", async ()=>{
        
        const friendButton = screen.getByRole("button", { name : "Friends"})
        await userEvent.click(friendButton)
        expect(screen.getByText("user friend 1")).toBeInTheDocument()
    })

    it("should call the handleAreGroupMembersChanged", async ()=> {
        const user = userEvent.setup()

        const makeAdminButton = screen.getAllByRole("button", { name : "Admin"})
        const removeMemberButton = screen.getAllByRole("button", { name : "Remove"})

        await user.click(makeAdminButton[0]) 
        expect(handleAreGroupMembersChanged).toHaveBeenCalledTimes(1)

        await user.click(removeMemberButton[0])
        expect(handleAreGroupMembersChanged).toHaveBeenCalledTimes(2)

        const friendsMenu = screen.getByRole("button", { name : "Friends"})
        await user.click(friendsMenu)

        const addFriendButton = screen.getAllByRole("button", { name : "Add"})
        await user.click(addFriendButton[0])
        expect(handleAreGroupMembersChanged).toHaveBeenCalledTimes(3)

        const adminButton = screen.getByRole("button", { name : "Admins"})
        await user.click(adminButton)
        
        const removeAdminButton = screen.getAllByRole("button", { name : "Remove"})
        await user.click(removeAdminButton[0])
        expect(handleAreGroupMembersChanged).toHaveBeenCalledTimes(4)
        
    })

    it("should close the grouop manager", async ()=>{

        const cancelButton = screen.getByRole("button", { name : "Cancel"})
        await userEvent.click(cancelButton)
        expect(openGroupManager).toHaveBeenCalledOnce()
    })

    it("should filter the members correctly", async ()=>{
        
        const searchButton = screen.getByRole("button", { name : "Search"})
        await userEvent.click(searchButton)

        const searchInput = screen.getByPlaceholderText("Enter to Search")
        expect(searchInput).toBeInTheDocument()

        await userEvent.type(searchInput, "test member 1")
        expect(screen.queryByText("test member 2")).not.toBeInTheDocument()
    })
});