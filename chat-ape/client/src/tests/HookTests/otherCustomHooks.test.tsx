import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, test } from "vitest";
import useConditionalChatFetch from "../../Components/hooks/useConditionalChatFetch";
import { customHooksRender, groupChatData } from "../testUtils";
import useCreateGroup from "../../Components/hooks/useCreateGroup";
import { act } from "react-dom/test-utils";
import useImageHook from "../../Components/hooks/useImageHook";
import useInterceptor from "../../Components/hooks/useInterceptors";
import useLocalStorage from "../../Components/hooks/useLocalStorage";
import useSearch from "../../Components/hooks/useSearch";

describe('tests the userConditionalChatFetch hook', () => {  
    it("should return the chat div for the group chat", ()=>{
        const { result } = renderHook(()=> useConditionalChatFetch(groupChatData))
        expect(result.current.chatDiv.current).toBe(null)
    })

})

describe('tests the useCreateGroup hook', () => { 


    it('should give the inital values of the hook', () => { 
        const { result } = renderHook(()=> useCreateGroup())
        const returnedObject = result.current
        expect(returnedObject.friendsIncluded.length).toBe(0)
        expect(returnedObject.imageUrl).toBe("/placeholder.png")
        expect(returnedObject.rawImageFile).not.toBeDefined()
     })

     it("should test the functions returned from the hook ", async ()=>{

        const { result } = renderHook(()=> useCreateGroup())
        const { handleAddRemoveButtonClick } = result.current
        act(()=> handleAddRemoveButtonClick("member1"))
        expect(result.current.friendsIncluded.length).toBe(1)
        act(()=> { 
            result.current.handleAddRemoveButtonClick("member1")
            result.current.handleAddRemoveButtonClick("member1")
        }) 
        expect(result.current.friendsIncluded.length).toBe(0)

     })
 })

 describe("tests the useImageHook", ()=>{
    it("should return placeholder image when no url is provided", ()=>{
        const { result } = customHooksRender(useImageHook)
        expect(result.current).toBe("/placeholder.png")
    })

    it('should return the url itself if it start with https', () => { 
        const { result } = customHooksRender(()=> useImageHook("https:random"))
        expect(result.current).toBe("https:random")
     })

    it('should return the url itself if it start with https', () => { 
        const { result } = customHooksRender(()=> useImageHook("/user/get-chat-image/image-123"))
        expect(result.current).toEqual(expect.any(String))
     })
 })

 describe('tests the useInterceptor hook', () => { 
    it("successfully adds the interceptor on the axios instance", async ()=>{
        const { result } = customHooksRender(() => useInterceptor())
        const axiosInstance = result.current
        expect(axiosInstance).toBeDefined()
    })
  })

describe('tests the useLocalStorage hook', () => { 
    it('should correctly store and retrieve from the local storage', () => { 

        const { result } = renderHook(useLocalStorage)
        const { setItem,  removeItem, getItem } = result.current
        setItem("random", { 
            accessToken : "access",
            refreshToken : "refresh",
            is2FactorAuthEnabled : false,
            isGoogleUser : false,
        })
        getItem("random")
        const storedItem = result.current.getItem("random")
        expect(storedItem).toHaveProperty("accessToken", "access")

        removeItem("random")
        expect(getItem("random")).not.toBeDefined()
     })
 })
 
 describe('tests the useSearch hook', () => { 
    it('should successfully execute the functions from the hok', () => { 
        const { result } = renderHook(()=> useSearch()) 
        const { searchInput, chatSearchInput, filterOptions } = result.current
        expect(searchInput).toBe("")
        expect(chatSearchInput).toBe("")
        expect(filterOptions).toEqual({filterClicked : false, type : "normal"})

        const newSearchInput = "search"
        act(()=> result.current.handleSearchInputChange(newSearchInput))
        act(()=> result.current.handleChatSearchInputChange(newSearchInput))
        act(()=> result.current.handleIsFilterClicked(true, "group"))

        expect(result.current.searchInput).toBe(newSearchInput)
        expect(result.current.chatSearchInput).toBe(newSearchInput)
        expect(result.current.filterOptions).toEqual({ filterClicked : true, type : "group"})
    })
  })

