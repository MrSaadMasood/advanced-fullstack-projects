const { dbConnection, dbDisconnect } = require("../testUtils");
const supertest = require("supertest")
const indexRouter = require("../../routes/index")
const express = require("express");

// const database = await dataBaseConnectionMaker(process.env.URI)

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended : false}))


app.use("/auth-user", indexRouter)

const api = supertest(app)

describe("tests block for the session controllers", ()=>{
    beforeAll( async ()=>{
        await dbConnection()
    })

    afterAll(async ()=>{
        await dbDisconnect()
    })

    let refreshToken;

    it("test the connection", async ()=>{
        const result = await api.post("/auth-user/sign-up").type("form").send({
            fullName : "test",
            email : "test1@gmail.com",
            password : "Testing.1234"
        })
        expect(result.status).toBe(200)
        expect(result.statusCode).toBe(200)
        expect(result.type).toBe("application/json")
        expect(result).toHaveProperty("_body", { message : "user successfully created"})
    })

    it("tests the login route", async ()=>{
        const result = await api.post("/auth-user/login").type("form").send({
            email : "saad@gmail.com",
            password : "Saad.Masood1122"
        })
        expect(result.status).toBe(200)
        expect(result.statusCode).toBe(200)
        expect(result.type).toBe("application/json")
        expect(result._body).toEqual(
            expect.objectContaining({
                accessToken : expect.any(String),
                refreshToken : expect.any(String)
            })
            )
        refreshToken = result._body.refreshToken

        const error = await api.post("/auth-user/login").type("form").send({
            email : "randomDude",
            password : "Random.123"
        })
        expect(error.status).toBe(404)
        expect(error).toHaveProperty("_body", { error : "user not found"})
    })

    it("tests the refresh token route", async ()=>{
        const result = await api.post("/auth-user/refresh").type("form").send({
            refreshToken
        })

        expect(result.status).toBe(200)
        expect(result._body).toEqual(expect.objectContaining({
            newAccessToken : expect.any(String)
        }))

        const error = await api.post("/auth-user/refresh").type("form").send({
            refreshToken : "fakeToken"
        })

        expect(error.status).toBe(399)
        expect(error).toHaveProperty("_body", { error : "cannot refresh the token"})
    })

    it("tests the logout route", async ()=>{
        const result = await api.delete(`/auth-user/logout/${refreshToken}`)

        expect(result.status).toBe(200)
        expect(result).toHaveProperty("_body", {  message: "user successfully logged out" })

        const error = await api.delete(`/auth-user/logout/${"fakeToken"}`)

        expect(error.status).toBe(400)
        expect(error).toHaveProperty("_body", { error: "logout failed" })
    })
})
