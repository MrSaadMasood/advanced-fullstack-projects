import express, { NextFunction, Response } from "express"
import supertest from "supertest"
import { dbConnection, dbDisconnect, googleTokens, googleUserIntermediaryToken, sampleRefreshToken, signUpWithGoogleCode } from "./testUtils"
import indexRouter from "../src/routes/authRouter";
import factor2AuthRouter from '../src/routes/factor2Router'
import { authenticateUser, factor2RouteTokenAuthenticator } from "../src/middlewares/AuthMiddlewares";
import userRouter from './../src/routes/userRouter'     
import { CustomRequest } from "../src/Types/customRequest";
import { errorMiddleware } from "../src/middlewares/errorMiddleware";
import "express-async-errors"
const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended : false}))

app.use("/auth-user", indexRouter)
app.use("/factor2", factor2RouteTokenAuthenticator ,factor2AuthRouter)
app.use("/user", authenticateUser, userRouter)
app.use(errorMiddleware)

const api = supertest(app)
let loggedInUserAccessToken : string;
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

jest.mock('../src/middlewares/multer', () =>{
    return {
        upload : {
            single : jest.fn(
                () => 
                (_req : CustomRequest, _res : Response, next : NextFunction)=> {
                    _req.file! = {
                        ..._req.file!,
                        filename : _req.body.image
                    }
                    next()
        })}
    }
} )

beforeAll( async ()=>{
    await dbConnection()
    const response = await api.post("/auth-user/login").type("form").send({
        email : "saad@gmail.com",
        password : "Saad.Masood1122"
    })
    loggedInUserAccessToken = `Bearer ${response.body.accessToken}`
})

afterAll(async ()=>{
    await dbDisconnect()
})

export default api
export {
    loggedInUserAccessToken
}