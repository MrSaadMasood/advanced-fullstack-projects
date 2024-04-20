import fs from "fs/promises"
import api, { loggedInUserAccessToken } from "../../jest.setup"

describe('tests the delete profile picture functionality', () => { 
    beforeAll(()=>{
        jest.spyOn(fs, "unlink").mockImplementation(()=> Promise.resolve() )
    })
    afterAll(() => jest.clearAllMocks())

    it("tests the delete profile picture functionality", async () =>{
        const response = await api.delete(`/user/delete-previous-profile-picture/${"randomProfilePicture"}`)
            .set("Authorization", loggedInUserAccessToken)

        expect(response.status).toBe(200)
    })
 })