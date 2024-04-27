import { describe, expect, it } from "vitest";
import getFilteredData, { filterChatData, groupManagerFilter, indexfinder, replaceArrayMemberWithModifiedOne } from "../../utils/filterArrayFunction";
import { completeChatData, generalGroupData, groupChatData, groupMembers, userData } from "../testUtils";
import { ChatData, GroupChatData } from "../../Types/dataTypes";

describe("tests the filter array function", ()=>{

    it("should filter the general group data", ()=>{
        const filteredData = getFilteredData([generalGroupData], 4, "chat")
        expect(filteredData).toHaveLength(1)
        expect(getFilteredData([generalGroupData], 4, "random")).toHaveLength(0)
    })

    it("should filter the accessory data", ()=>{
        expect(getFilteredData(groupMembers, 2, "1")).toHaveLength(1)
        expect(getFilteredData(groupMembers, 3, "test member")).toHaveLength(2)
    })
})

describe('tests the filter chat data function', () => { 
    it("should filter the normal chat data", ()=>{

        const normalChatDataFilter = filterChatData(completeChatData, "normal", "error") as ChatData
        expect(normalChatDataFilter.chat).toHaveLength(1)
    })

    it("should filter the group chat data", ()=>{

        const filteredGroupChatData = filterChatData(groupChatData, "group", "3") as GroupChatData
        expect(filteredGroupChatData).toHaveLength(0)
    })
})

describe('tests the groupManagerFilter', () => { 
    it("should filter the group members", ()=>{

        expect(groupManagerFilter([], "random")).toHaveLength(0)
        expect(groupManagerFilter(groupMembers, "admin")).toHaveLength(1)
    })
 })

describe('tests the getModifiedArray', () => { 
    it("should return the modified array", ()=>{
        const modifiedArrayMember = {

            admins : ["69", "3"],
            members : ["1", "2", "69"],
            collectionId : "groupCollection1",
            groupImage : null,
            groupName : "modifiedGroup",
            id : "100"

        } 
        
        const modifiedArray = replaceArrayMemberWithModifiedOne(userData.groupChats, modifiedArrayMember)
        expect(modifiedArray[0].groupName).toBe(modifiedArrayMember.groupName)
    })
})

describe('tests the indexfinder function', () => { 
    it("should return the index if found and -1 if not found", ()=>{
        const array = ["1","2","3","4","5","6"]
        expect(indexfinder(array, "2")).toBe(1)

        expect(indexfinder(array, "8")).toBe(-1)
    })
 })