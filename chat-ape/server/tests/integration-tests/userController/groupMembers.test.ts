import api, { loggedInUserAccessToken } from "../../jest.setup"

    it("get all the group members of a particular group", async () =>{
        const response = await api.get(`/user/group-members/${"f7f29bde-6ffb-47f4-bdeb-2bd5019312cf"}`)
            .set("Authorization", loggedInUserAccessToken)
        
            expect(response.status).toBe(200)
            expect(response.body[0]).toEqual(expect.objectContaining({
               _id : expect.any(String),
               fullName : expect.any(String) 
            }))

        expect(() => api.get(`/user/group-members/${"ranodmGroupId"}`)
            .set("Authorization", loggedInUserAccessToken)).rejects.toThrow()
    })