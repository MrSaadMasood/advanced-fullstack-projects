import api, { loggedInUserAccessToken } from "../../jest.setup"

    it("tests the /remove-follow-request route", async ()=>{

        const result = await api.delete(`/user/remove-follow-request/${"28a2c354-3958-4a29-94c7-1440908dcd7f"}`)
            .set("Authorization", loggedInUserAccessToken)

        expect(result.status).toBe(200)
        expect(result.body).toEqual({message : "successfully removed follow request"})

        expect(() => api.delete(`/user/remove-follow-request/${"hexaabcdef"}`)
        .set("Authorization", loggedInUserAccessToken))
            .rejects.toThrow()
    })
