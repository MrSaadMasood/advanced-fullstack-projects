import api from "../../jest.setup"
import { sampleRefreshToken } from "../../testUtils"

describe('tests the logout functionality', () => {

    it("tests the logout route", async ()=>{
        const result = await api.delete(`/auth-user/logout`).type("form").send({
            refreshToken : sampleRefreshToken
        })
        expect(result.status).toBe(200)
        expect(result.body).toBe("user successfully logged out")
        
    })

    it("negative case: tests logout failure", ()=>{
        
        expect(()=> api.delete(`/auth-user/logout`).type("form").send({
            refreshToken : "fake token"
        }) ).rejects.toThrow()
    })
})