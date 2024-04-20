import api, { loggedInUserAccessToken } from "../../jest.setup"

    it("tests the add member to group funcationality", async ()=>{
        const response = await api.put("/user/add-group-member")
            .set("Authorization", loggedInUserAccessToken)
            .type("form")
            .send({
                collectionId : "f7f29bde-6ffb-47f4-bdeb-2bd5019312cf",
                friendId : "1914f89e-aca2-4f6a-92c6-e8cb59e62935" 
            })
        
        expect(response.status).toBe(200)
        expect(response.body).toEqual({ message : "friend successfulllye added to group" })

    })