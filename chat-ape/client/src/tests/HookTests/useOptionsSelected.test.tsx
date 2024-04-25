import { describe, expect, it } from "vitest";
import { chat1, customHooksRender, TestProviderWrappers } from "../testUtils";
import useOptionsSelected from "../../Components/hooks/useOptionsSelected";
import { renderHook, waitFor } from "@testing-library/react";
import { act } from "react-dom/test-utils";

describe("tests the useOptionsSelected hook", ()=>{
    it("should get the normal chat list ", async () =>{

        const { result } = customHooksRender(()=> useOptionsSelected(1))
        
        await waitFor(() => expect(result.current.chatList).toHaveLength(1)) 
        chat1.content = "changed content"
        act(() => result.current.chatListArraySetter("1", chat1, "normal"))
        expect(result.current.chatList[0].lastMessage).toHaveProperty("content", "changed content")
    })

    it('should get the friend list', async () => { 
        
        const { result } = customHooksRender(()=> useOptionsSelected(2))
        await waitFor(()=> expect(result.current.friendsArray).toHaveLength(1))
        await waitFor(()=> result.current.removeFollowRequestAndFriend("99", "friends"))   
        expect(result.current.friendsArray).toHaveLength(0)
     })

    it("should get the users list", async ()=>{
        const { result } = customHooksRender(()=> useOptionsSelected(5))
        await waitFor(()=> expect(result.current.allUsersArray).toHaveLength(1))
    })

    it("should get the received requests", async ()=>{
        const { result } = customHooksRender(()=> useOptionsSelected(3))
        await waitFor(()=> expect(result.current.followRequestsArray).toHaveLength(1))
    })
})

