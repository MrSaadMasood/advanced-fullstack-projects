import "@testing-library/jest-dom"
import { customRender, groupMembers, isUserChangedSetter, setGlobalError, user, userData } from "../testUtils"
import { screen, waitFor } from "@testing-library/react"
import { describe, beforeEach, it, expect, vi } from "vitest"
import UserManagingList from "../../Components/ListsComponets/UserManagingList"
import Users from "../../Components/ListsComponets/Users"

describe('tests the UserManagingList component', () => { 

    it('should render the component successfully', () => { 

        customRender(
            <UserManagingList
                member={groupMembers[0]}
            >
                <div>random</div>
            </UserManagingList>
        )
        expect(screen.getByText("random")).toBeInTheDocument()
        expect(screen.queryByText("test member 1")).toBeInTheDocument()
    })

 })

 describe("tess the Users compoenent", ()=>{
    const addToSentRequests = vi.fn()
    
    beforeEach(()=>{
        customRender(
            <Users 
                isUserChangedSetter={isUserChangedSetter}
                data={groupMembers[1]}
                addToSentRequests={addToSentRequests}
                setGlobalError={setGlobalError}
                userData={userData}
            />
        )
    })

    it('should render the component successfully', () => { 
        
        
        expect(screen.getByText("test member 2")).toBeInTheDocument()
        expect(screen.getByText("Follow")).toBeInTheDocument()
        expect(screen.queryByText("Sending")).not.toBeInTheDocument()
     })

     it("should the follow request to the user", async ()=>{
        const followButton = screen.getByRole("button", { name : "Follow"})
        await user.click(followButton)
        await waitFor(()=>{
            expect(isUserChangedSetter).toHaveBeenCalledTimes(1)
        })
     })
 })