import express from "express"
import supertest from "supertest"
import { dbConnection, dbDisconnect, googleTokens, googleUserIntermediaryToken, sampleRefreshToken, signUpWithGoogleCode } from "./testUtils"
import indexRouter from "../src/routes/authRouter";
import factor2AuthRouter from '../src/routes/factor2Router'
import { authenticateUser, factor2RouteTokenAuthenticator } from "../src/middlewares/AuthMiddlewares";
import userRouter from './../src/routes/userRouter'     

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended : false}))


app.use("/auth-user", indexRouter)
app.use("/factor2", factor2RouteTokenAuthenticator ,factor2AuthRouter)
app.use("/user", authenticateUser, userRouter)

const api = supertest(app)

jest.mock("../src/utils/googleTokenFuncs", () =>{
    const original = jest.requireActual("../src/utils/googleTokenFuncs")
    return {
        ...original,
        refreshGoogleAccessToken : jest.fn((value : string) => {
            if(value === sampleRefreshToken || googleUserIntermediaryToken) return Promise.resolve(googleTokens)
            return Promise.reject()
        }),
        googleTokensExtractor : jest.fn((code : string) => {
            if(code === signUpWithGoogleCode) return Promise.resolve(googleTokens)
            return Promise.resolve(undefined)
        })
    }
})


jest.mock("axios", ()=>{
    const originalAxios = jest.requireActual("axios")
    return {
        ...originalAxios,
        post : jest.fn().mockImplementation(()=> {
            return Promise.resolve()
            
        })
    }
})

beforeAll( async ()=>{
    await dbConnection()
})

afterAll(async ()=>{
    await dbDisconnect()
})

export default api