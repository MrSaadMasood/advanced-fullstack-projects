import api from "../../jest.setup"

describe("tests the login functionality", () => {

    describe("tests the successfull login", ()=>{

        it("tests the normal user login route", async ()=>{
            const result = await api.post("/auth-user/login").type("form").send({
                email : "ammar@gmail.com",
                password : "Ammar.Masood1122",
            })

            expect(result.status).toBe(200)
            expect(result.statusCode).toBe(200)
            expect(result.type).toBe("application/json")
            expect(result.body).toEqual(
                expect.objectContaining({
                    accessToken : expect.any(String),
                    refreshToken : expect.any(String)
                })
            )

        })

        it("tests the user logging in from google accound", async ()=>{

            const is2FactorRoute = await api.post("/auth-user/login").type("form").send({
                email : "tester@gmail.com",
                password : "Tester.123"
            })

            expect(is2FactorRoute.body).toEqual(expect.objectContaining({
                is2FactorAuthEnabled  : true
            }))
        })
    })

    describe("tests the login failure on incorrct credentials", ()=>{

        it("tests if the user which does not exist in the database", ()=>{
            expect(()=> api.post("/auth-user/login").type("form").send({
                email : "randomDude@gmail.com",
                password : "Random.123"
            })).rejects.toThrow()
        })

        it("tests the wrong password login try", ()=>{
            expect(()=> api.post("/auth-user/login").type("form").send({
                email : "ammar@gmail.com",
                password : "Random.123"
            })).rejects.toThrow("password do not match")
        })
    })
})