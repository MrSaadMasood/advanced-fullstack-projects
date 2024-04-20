import api, { loggedInUserAccessToken } from "../../jest.setup"

describe('tests the group manager functinality', () => { 
    it("tests the remove group member functinality", async ()=>{
        const response = await api.delete("/user/remove-group-member")
            .set("Authorization", loggedInUserAccessToken)
            .query({
                collectionId : "f7f29bde-6ffb-47f4-bdeb-2bd5019312cf",
                memberId : "100020747428319565071"
            })

        expect(response.status).toBe(200)
        expect(response.body).toEqual({ message : "member successfullly removed"})
        
        expect(()=> api.delete("/user/remove-group-member")
            .set("Authorization", loggedInUserAccessToken)
            .query({
                collectionId : "f7f29bde-6ffb-47f4-bdeb-2bd5019312cf",
                memberId : "fake-member"
            })).rejects.toThrow()
    })
    
 })