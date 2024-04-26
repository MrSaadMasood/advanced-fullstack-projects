import "@testing-library/jest-dom"
import { renderHook, waitFor } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import useGroupManager from "../../Components/hooks/useGroupManager"
import { friendData, groupMembers, TestProviderWrappers, userData } from "../testUtils"

describe("tests the useGroupManager hook", ()=>{
    const setGlobalError = vi.fn()
    const changeUserDataBasedOnGroupChanges = vi.fn()
    const handleAreGroupMembersChanged = vi.fn() 

    it("should test the initial values of the hook", async ()=>{
        const { result } = renderHook(()=> useGroupManager({
            userData : userData,
            groupId : "member1",
            groupMembers,
            setGlobalError,
            friends : [ friendData ],
            changeUserDataBasedOnGroupChanges,
            handleAreGroupMembersChanged    
        }), { wrapper : TestProviderWrappers })

        console.log("the reuslt of the use Groupmamanger is", result.current)
        const { infoButtonsArray, searchInput, setSearchInput, isFriendBeingAdded } = result.current

        expect(infoButtonsArray).toHaveLength(3)
        expect(searchInput).toBe("")
        expect(isFriendBeingAdded).toBe(false)
        
        await waitFor(()=> setSearchInput("searching"))
        await waitFor(()=> expect(result.current.searchInput).toBe("searching"))
    })

    it("should test the complete functtionality of the hook", async ()=>{

        const { result } = renderHook(()=> useGroupManager({
            userData : userData,
            groupId : "member1",
            groupMembers,
            setGlobalError,
            friends : [ friendData ],
            changeUserDataBasedOnGroupChanges,
            handleAreGroupMembersChanged    
        }), { wrapper : TestProviderWrappers })

        const  { handleMakeMemberAdmin, handleAdminRemoval, handleMemberRemoval } = result.current

        await waitFor(() => handleMakeMemberAdmin("69"))
        expect(handleAreGroupMembersChanged).toHaveBeenCalled()

        await waitFor(() => handleAdminRemoval("69"))
        expect(changeUserDataBasedOnGroupChanges).toHaveBeenCalledTimes(2)

        await waitFor(() => handleMemberRemoval("3"))
        expect(changeUserDataBasedOnGroupChanges).toHaveBeenCalledTimes(3)
    })
})