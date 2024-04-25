import { describe, expect, it, vi } from "vitest";
import { chat1, customHooksRender, friendData, generalGroupData, groupChatData, handleIsFilterClicked, TestProviderWrappers, userData } from "../testUtils";
import useWebSockets from "../../Components/hooks/useWebSockets";
import { act, renderHook, waitFor } from "@testing-library/react";

describe("tests the useWebSockets hook",()=>{
    const chatListArraySetter = vi.fn() 
    it("should give the initial values of the hook", async ()=>{
        const { result } = customHooksRender(()=> useWebSockets(
            handleIsFilterClicked,
            chatListArraySetter,
            userData
        ))

        const { normalChatData, groupChatData, groupMembersData } = result.current
        expect(normalChatData.chat).toHaveLength(0)
        expect(groupChatData).toHaveLength(0)
        expect(groupMembersData ).toHaveLength(0)
    })

    it('should get the group chat data', async ()=>{

        const { result } = renderHook(()=> useWebSockets(
            handleIsFilterClicked,
            chatListArraySetter,
            userData
        ), { wrapper : TestProviderWrappers})
        
        await waitFor(()=> result.current.getChatData(generalGroupData))
        await waitFor(()=> expect(result.current.groupChatData).toHaveLength(2))
        await waitFor(()=> expect(result.current.groupMembersData).toHaveLength(5))
    
    })

    it("should add new data to the group chat data and then delete the data", async ()=>{

        const { result } = renderHook(()=> useWebSockets(
            handleIsFilterClicked,
            chatListArraySetter,
            userData
        ), { wrapper : TestProviderWrappers})

        const message = { ...chat1, content : "added data", id : "addedId"}
        await waitFor(()=> result.current.getChatData(generalGroupData))
        await waitFor(()=> result.current.chatDataSetter(message, "group", generalGroupData))
        await waitFor(()=> expect(result.current.groupChatData).toHaveLength(3))

        // removing the added data from the groupChatData

        await waitFor(()=> result.current.removeDeletedMessageFromChat("addedId", "group"))
        await waitFor(()=> expect(result.current.groupChatData).toHaveLength(2))


    })

    it("should get the filtered chat from the of the group chat data", async ()=>{

        const { result } = renderHook(()=> useWebSockets(
            handleIsFilterClicked,
            chatListArraySetter,
            userData
        ), { wrapper : TestProviderWrappers})

        const dateToFilterChat = new Date()
        await waitFor(()=> result.current.getChatData(generalGroupData))
        await waitFor(()=> expect(result.current.groupChatData).toHaveLength(2))
        await waitFor(()=> result.current.getFilteredChat(dateToFilterChat, "1", "group"))
        await waitFor(()=> expect(result.current.groupChatData).toHaveLength(1) )

    })

    it("gets the normal chat data, adds new Data to it and removed the new data", async ()=>{

        const { result } = renderHook(()=> useWebSockets(
            handleIsFilterClicked,
            chatListArraySetter,
            userData
        ), { wrapper : TestProviderWrappers})

        await waitFor(()=> result.current.getChatData(friendData))
        await waitFor(()=> expect(result.current.normalChatData.chat).toHaveLength(2))

        // adding in the normal chat data

        const message = { ...chat1, content : "added data", id : "addedId"}
        await waitFor(()=> result.current.chatDataSetter(message, "normal"))
        await waitFor(()=> expect(result.current.normalChatData.chat).toHaveLength(3))

        // remove the added mesage from the normal chat data

        await waitFor(()=> result.current.removeDeletedMessageFromChat("addedId", "normal"))
        await waitFor(()=> expect(result.current.normalChatData.chat).toHaveLength(2))
    })
})