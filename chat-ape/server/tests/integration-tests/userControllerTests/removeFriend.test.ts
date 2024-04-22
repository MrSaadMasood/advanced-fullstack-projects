import api, { loggedInUserAccessToken } from "../../jest.setup";

describe('tests the /remove-friend route', () => { 
    it("shoudl remove the friend", async ()=>{

        const result = await api.delete(`/user/remove-friend/${"100020747428319565071"}`)
            .set("Authorization", loggedInUserAccessToken)

        expect(result.status).toBe(200)
        expect(result.body).toEqual({message : "successfully removed friend"})
        
    })

    it('should fail to remove the friend', () => { 
        expect(() => api.delete(`/user/remove-friend/${"hexaabcdef"}`)
            .set("Authorization", loggedInUserAccessToken)).rejects.toThrow()
     })

})
