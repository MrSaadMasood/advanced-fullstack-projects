import api, { loggedInUserAccessToken } from "../../jest.setup"

    it("tests the make a member admin funcationality", async ()=>{
        const response = await api.put("/user/make-member-admin")
            .set("Authorization", loggedInUserAccessToken)
            .type("form")
            .send({
                collectionId : "f7f29bde-6ffb-47f4-bdeb-2bd5019312cf",  
                memberId : "100020747428319565071"
            })
        
        expect(response.status).toBe(200)
        expect(response.body).toEqual({ message : "successfully made admin" })
    })