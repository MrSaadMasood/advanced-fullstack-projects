import api, { loggedInUserAccessToken } from "../../jest.setup"

describe('tests the remove admin from group funcationality', () => { 

    it("should remove the admin of the group", async ()=>{
        const response = await api.delete("/user/remove-group-admin")
            .set("Authorization", loggedInUserAccessToken)
            .query({
                collectionId : "f7f29bde-6ffb-47f4-bdeb-2bd5019312cf",
                memberId : "f06ec470-49b4-4f90-bb87-93b078eea9e9"
            })

        expect(response.status).toBe(200)
        expect(response.body).toEqual({ message : "the admin has been successfullly removed"})

    })

    it('should fail to remove the admin', () => { 

        expect(()=> api.delete("/user/remove-group-admin")
            .set("Authorization", loggedInUserAccessToken)
            .query({
                collectionId : "f7f29bde-6ffb-47f4-bdeb-2bd5019312cf",
                memberId : "fake-admin"
            })).rejects.toThrow()

     })
})