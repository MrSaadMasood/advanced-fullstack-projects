import api, { loggedInUserAccessToken } from "../../jest.setup"

    it("tests the group-data route", async ()=>{

        const result = await api.post("/user/group-data").set("Authorization", loggedInUserAccessToken)
            .type("form")
            .send({
                groupId : "f7f29bde-6ffb-47f4-bdeb-2bd5019312cf",
                content : "test content"
            })

        expect(result.status).toBe(200)
        expect(result.body).toEqual({ id : expect.any(String)})

        expect(() => api.post("/user/group-data").set("Authorization", loggedInUserAccessToken)
            .type("form")
            .send({
                groupId : "randomgorup1234",
                content : "test content"
            })).rejects.toThrow()
    })
