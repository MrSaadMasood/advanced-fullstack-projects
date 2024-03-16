const { createUser, loginUser, refreshUser, logoutUser } = require("../../controllers/sessionController")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

jest.mock("bcrypt", ()=>({
    hash : jest.fn((password, salt, callback)=>callback(true, "hashedPassword")),
    compare : jest.fn((password, hashedPassword)=> false)
}))

jest.mock("jsonwebtoken" , ()=>({
    sign : jest.fn((options, string)=> "refreshToken"),
    verify : jest.fn((token ,secret, callback)=> callback(true, { id : 1 }))
}))

jest.mock("mongodb", ()=>{
    
    const insertOne = jest.fn((value)=> ({ result : { ok : 1}}))
    const findOne = jest.fn((value)=> ({ _id : 1, password : "testing" }))
    const deleteOne = jest.fn( value => ({ deletedCount : 0}))
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
let res;

beforeEach(()=>{

    res = {
        json : jest.fn( value => value),
        status : jest.fn().mockReturnThis(),
        sendStatus : jest.fn()
    }
})
afterEach(()=> jest.restoreAllMocks())

describe("it tests the sessionController", ()=>{

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
        expect(res.json).toHaveBeenCalled()
        expect(res.json).toHaveBeenCalledWith({ error : "the user could not be created" })
        expect(res.status).toHaveBeenCalled()
    })

    it("tests the loginUserFunction", async ()=>{
        const req = {
            body : {
                email : "test@gmail.com",
                password : "testing"
            }
        }

        await loginUser(req, res)

        expect(jwt.sign).not.toHaveBeenCalled()
        expect(bcrypt.compare).toHaveBeenCalledWith(req.body.password, "testing")
        expect(res.json).toHaveBeenCalledWith({ message : "user not found"})
        expect(res.status).toHaveBeenCalledWith(404)
    })

    it("tests the refreshUser function", async ()=>{
        const req = {
            body : {
                refreshToken : "token"
            }
        }

        await refreshUser(req, res)
        expect(jwt.verify).toHaveBeenCalled()
        expect(res.json).not.toHaveBeenCalledWith()
        expect(res.sendStatus).toHaveBeenCalledWith(399)
    })

    it("tests the logoutUser function", async ()=>{
        const req = {
            params : {
                user : "token"
            }
        }

        await logoutUser(req, res)

        expect(res.json).toHaveBeenCalled()
        expect(res.json).toHaveBeenCalledWith({error : "logout failed"})
        expect(res.status).toHaveBeenCalledWith(400)
    })
})
