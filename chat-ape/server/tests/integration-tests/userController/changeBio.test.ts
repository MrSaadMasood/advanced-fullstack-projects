import api, { loggedInUserAccessToken } from "../../jest.setup"

    it("tests the change-bio", async ()=>{
        
        const result = await api.post("/user/change-bio").set("Authorization", loggedInUserAccessToken).type("form")
            .send({bio : "testBio"})

        expect(result.status).toBe(200)
        expect(result.body).toEqual({message : "the bio has been successfullly added"})
    })