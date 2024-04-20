import { BadRequest } from "../../../src/ErrorHandler/customError"
import api, { loggedInUserAccessToken } from "../../jest.setup"

    it("tests the /chat-data route", async ()=>{

        const result = await api.post(`/user/chat-data`).set("Authorization", loggedInUserAccessToken)
            .type("form").send({ 
                collectionId : "bc8c0ee9-a591-4def-b1ac-192fdcba6027", content : "testContent"
            })
        
        expect(result.status).toBe(200)
        expect(result.body).toHaveProperty("id", expect.any(String))

        expect(() => api.post(`/user/chat-data`).set("Authorization", loggedInUserAccessToken)
            .type("form").send({ 
                collectionId : "hexaabcd", content : "testContent"
            })).rejects.toThrow(new BadRequest)
            
    })