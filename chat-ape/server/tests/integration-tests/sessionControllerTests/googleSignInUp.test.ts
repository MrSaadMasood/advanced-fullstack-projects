import { googleTokens,signUpWithGoogleCode } from "../../testUtils"
import api from "../../jest.setup"
import oAuth2Client from "../../../src/utils/oAuth2Client"



describe("tests the sign up / sign-in with google functionality", ()=>{
    describe('for the normal 2factor auth disabled userData', () => { 
        beforeAll(()=>{
            jest.spyOn(oAuth2Client, "verifyIdToken").mockImplementation(()=> Promise.resolve({
                getPayload : jest.fn(()=>({
                    name : "google name",
                    email : "google email",
                    picture : "google picture",
                    sub : "1122",
                    at_hash : "Google.123"
                }))
            }))
        })
            
        it("user signing up from google account for the first tiem", async ()=>{
            const response = await api.post("/auth-user/google").type("form").send({
                code : signUpWithGoogleCode
            })
            
            expect(response.status).toBe(200)
            expect(response.body).toEqual(googleTokens)
        })
    })

    describe("already existing user google sign in", ()=>{
        beforeAll(()=>{
            jest.spyOn(oAuth2Client, "verifyIdToken").mockImplementation(()=> Promise.resolve({
                getPayload : jest.fn(()=>({
                    name : "tester",
                    email : "tester@gmail.com",
                    picture : "google picture",
                    sub : "1122",
                    at_hash : "Tester.123"
                }))   
            }))

        })
        afterAll(()=> jest.clearAllMocks())

        it("if factor 2 auth enabled", async ()=>{
            const response = await api.post("/auth-user/google").type("form").send({
                code : signUpWithGoogleCode
            })
            
            expect(response.status).toBe(200)
            expect(response.body).toEqual(expect.objectContaining({
                isGoogleUser : expect.any(Boolean),
                factor2AuthToken : expect.any(String)
            }))
        })
    })

    describe("existing user google sign in", ()=>{
        beforeAll(()=>{
            jest.spyOn(oAuth2Client, "verifyIdToken").mockImplementation(()=> Promise.resolve({
                getPayload : jest.fn(()=>({
                    name : "Hamza Saleem",
                    email : "hamza@gmail.com",
                    picture : "google picture",
                    sub : "1122",
                    at_hash : "Hamza.Saleem1122"
                }))   
            }))

        })
        afterAll(()=> jest.clearAllMocks())

        it("if factor 2 auth disabled", async ()=>{
            const response = await api.post("/auth-user/google").type("form").send({
                code : signUpWithGoogleCode
            })
            
            expect(response.status).toBe(200)
            expect(response.body).toEqual(expect.not.objectContaining({
                factor2AuthToken : expect.any(String)
            }))
        })
    })
})

describe("negative-case: test sign in attempt with wrong google code", ()=>{

    it("tests if error is thrown", async ()=>{

        expect(()=> api.post("/auth-user/google").type("form").send({
            code : "ErrorCode" 
        })).rejects.toThrow("failed to extract tokends from google code")
    })
})