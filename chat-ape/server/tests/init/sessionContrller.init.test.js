const { createUser, loginUser, refreshUser, logoutUser} = require("../../controllers/sessionController")
const { generateAccessToken } = require("../../utils/utils")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

jest.mock("bcrypt", ()=>({
    hash : jest.fn((password, salt, callback)=>callback(null, "hashedPassword")),
    compare : jest.fn((password, hashedPassword)=>true)
}))

jest.mock("jsonwebtoken" , ()=>({
    sign : jest.fn((options, string)=> "refreshToken"),
    verify : jest.fn((token ,secret, callback)=> callback(null, { id : 1 }))
}))


jest.mock("mongodb", ()=>{
    
    const insertOne = jest.fn((value)=> ({ result : { ok : 1}}))
    const findOne = jest.fn((value)=> ({ _id : 1, password : "testing" }))
    const deleteOne = jest.fn( value => ({ deletedCount : 1}))
    const collection = jest.fn((value)=>({
        insertOne,
        findOne,
        deleteOne
    }))
    const database = jest.fn(()=> ({
        collection
    }))

    return {
        MongoClient : {
        connect : jest.fn().mockResolvedValue({
            db : database
        })
    }
}})
describe("it tests the sessionController", ()=>{
    let res;

    beforeEach(()=>{

        res = {
            json : jest.fn( value => value),
            status : jest.fn().mockReturnThis()
        }
    })
    afterEach(()=> jest.restoreAllMocks())

    it("tests the createUserFuntion",  async ()=>{
        const req = {
            body : {
                fullName : "test",
                email : "test@gmail.com",
                password : "testing"
            }
        }


        await createUser(req, res)

        expect(bcrypt.hash).toHaveBeenCalled()
        expect(res.json).toHaveBeenCalledWith({ message: "user successfully created" })
        expect(res.status).not.toHaveBeenCalled()
    })

    it("tests the loginUserFunction", async ()=>{
        const req = {
            body : {
                email : "test@gmail.com",
                password : "testing"
            }
        }

        await loginUser(req, res)
        expect(jwt.sign).toHaveBeenCalled()
        expect(bcrypt.compare).toHaveBeenCalledWith(req.body.password, "testing")
        expect(res.json).toHaveBeenCalled()
        expect(res.status).not.toHaveBeenCalled()
    })

    it("tests the refreshUser function", async ()=>{
        const req = {
            body : {
                refreshToken : "token"
            }
        }

        await refreshUser(req, res)
        expect(jwt.verify).toHaveBeenCalled()
        expect(res.json).toHaveBeenCalled()
        expect(res.status).not.toHaveBeenCalled()
    })

    it("tests the logoutUser function", async ()=>{
        const req = {
            params : {
                user : "token"
            }
        }

        await logoutUser(req, res)

        expect(res.json).toHaveBeenCalled()
        expect(res.json).toHaveBeenCalledWith({ message: "user successfully logged out" })
        expect(res.status).not.toHaveBeenCalled()
    })

    it("tests the generate accesstoken function", ()=>{
        const token = generateAccessToken({ id : 1})
        expect(token).toBe("refreshToken") 
    })
})
