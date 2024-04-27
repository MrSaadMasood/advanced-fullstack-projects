import { describe, expect, it } from "vitest";
import profilePictureUrlMaker from "../../utils/profilePictureUrlMaker";
import { generateRoomId } from "../../utils/roomIdGenerator";

describe("tests the iamge url maker function", ()=>{
    it("should return the url of the image if its defined", ()=>{

        expect(profilePictureUrlMaker("image-1234")).toBe("/user/get-profile-picture/image-1234")
        expect(profilePictureUrlMaker(null)).toBeUndefined()
    
    })
})

describe('test the room id generator function', () => { 
    it("should generate the room id", ()=>{

        expect(generateRoomId("user", "friend")).toBe("roomfriend,user")
    })
 })