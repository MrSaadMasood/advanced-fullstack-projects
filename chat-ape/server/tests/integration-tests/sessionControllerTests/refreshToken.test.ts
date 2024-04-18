import api from "../../jest.setup"
import { sampleRefreshToken } from "../../testUtils"


describe("tests refreshing the accesstoken functionality", ()=>{
    describe("refresh the token for normal user successfully", ()=>{

        it("refresh normal user token", async ()=>{
            const result = await api.post("/auth-user/refresh").type("form").send({
                refreshToken : sampleRefreshToken,
                isGoogleUser : undefined
            })

            expect(result.status).toBe(200)
            expect(result.body).toEqual(expect.objectContaining({
                newAccessToken : expect.any(String)
            }))
        })
    
    })

    describe("tests refreshing the googler user token successfully", ()=>{

        it("tests refreshing the google usr refresh token", async ()=>{
            const googleRefreshPath = await api.post("/auth-user/refresh").type("form").send({
                refreshToken : sampleRefreshToken,
                isGoogleUser : true
            })
            expect(googleRefreshPath).resolves
            expect(googleRefreshPath.status).toBe(200)
            expect(googleRefreshPath.body).toEqual(expect.objectContaining({
                newAccessToken : expect.any(String)
            }))
        })
    })

    describe("fails to refresh the normal user token", ()=>{
        it("for normal user", ()=>{
            expect(()=> api.post("/auth-user/refresh").type("form").send({
                refreshToken : "fakeToken"
            })).rejects.toThrow()
        })
        })

    describe("failes to refresh the google user token", ()=>{
        it("for google user", ()=>{
            expect(()=> api.post("/auth-user/refresh").type("form").send({
                refreshToken : "fakeToken",
                isGoogleUser : true
            })).rejects.toThrow()
        })
    })
})
