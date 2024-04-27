import api from "../../jest.setup"
import { authenticator } from 'otplib' 
import { googleUserIntermediaryToken, intermediaryToken } from "../../testUtils"
describe("tests the qrcode generation functionality", ()=>{
    
    it("qr code successfully generated", async ()=>{
        const response = await api.get("/factor2/generate-otp").set("Authorization", intermediaryToken)

        expect(response.status).toBe(200)
        expect(response.body.startsWith("data")).toEqual(true)
    })
})

describe("tests the verification of otp", ()=>{

    beforeAll(()=>{
        jest.spyOn(authenticator, "check").mockImplementation(()=> (true))
    })
    afterAll(() => jest.clearAllMocks())

    it("otp is successfully verified for normal user", async ()=>{
        const response = await api.post("/factor2/verify-otp").set("Authorization", intermediaryToken).send({
            otp : "1212",
            refreshToken : intermediaryToken,
            isGoogleUser : false
        })

        expect(response.status).toBe(200)
        expect(response.body).toEqual(expect.objectContaining({
            isGoogleUser : false,
            refreshToken : expect.any(String),
            accessToken : expect.any(String),
            is2FactorAuthEnabled  : true
        }))
    })

    it("otp is verified for the google user", async ()=>{
        const response = await api.post("/factor2/verify-otp").set("Authorization", googleUserIntermediaryToken).send({
            otp : "1212",
            refreshToken : googleUserIntermediaryToken,
        })

        expect(response.status).toBe(200)
        expect(response.body).toEqual(expect.objectContaining({
            isGoogleUser : true,
            refreshToken : expect.any(String),
            accessToken : "google access token",
            is2FactorAuthEnabled  : true
        }))
    })
})