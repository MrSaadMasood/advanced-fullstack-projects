import api, { loggedInUserAccessToken } from '../../jest.setup';

// const database = await dataBaseConnectionMaker(process.env.URI)
// const client = clientMaker(process.env.URI) 

describe("tests the /user routes", ()=>{

    it("tests the /update-data route", async ()=>{
        const result = await api.get("/user/updated-data").set("Authorization", loggedInUserAccessToken)

        expect(result.status).toBe(200)
        expect(result.body).toEqual(expect.objectContaining({ 
            fullName : "saad",
            email : "saad@gmail.com"
        }))

        
        const error = await api.get("/user/update-data").set("Authorization", `Bearer randomtoken123`)

        expect(error.status).toBe(401)
        expect(error.body).toEqual({ error : "failed to authenticate user"})
    })
    
    it("tests the /get-users route", async ()=>{
        const result = await api.get("/user/get-users").set("Authorization", loggedInUserAccessToken)
        expect(result.status).toBe(200)
        expect(result.body.length).toBeGreaterThanOrEqual(0)
        expect(result.body[0]).toEqual(expect.objectContaining({
            fullName : expect.any(String)
        }))

    })

    it("tests the /send-request route", async ()=>{
        const result = await api.post("/user/send-request").set("Authorization", loggedInUserAccessToken)
            .send({ receiverId : "1914f89e-aca2-4f6a-92c6-e8cb59e62935"})

        expect(result.status).toBe(200)
        expect(result.body).toEqual({message : "request successfully sent"})

    })

    it("tests the /get-friends route", async ()=>{
        const result = await api.get("/user/get-friends").set("Authorization", loggedInUserAccessToken)

        expect(result.status).toBe(200)
        expect(result.body.length).toBeGreaterThanOrEqual(0)
        expect(result.body[0]).toEqual(expect.objectContaining({
            fullName : expect.any(String)
        }))

    })

    it("tests the /follow-requests route", async ()=>{
        const result = await api.get("/user/follow-requests").set("Authorization", loggedInUserAccessToken)

        expect(result.status).toBe(200)
        expect(result.body.length).toBeGreaterThanOrEqual(0)
        expect(result.body[0]).toEqual(expect.objectContaining({
            fullName : expect.any(String),
            _id : expect.any(String)
        }))

    })

    it("tests the /add-friend route", async ()=>{

        const result = await api.post("/user/add-friend").set("Authorization", loggedInUserAccessToken).send({ 
            friendId : "053bb438-2e14-4694-8c67-063f4a87b1cd"
        })

        expect(result.status).toBe(200)
        expect(result.body).toEqual({message : "friend successfully added"})

        expect(()=> api.post("/user/add-friend").set("Authorization", loggedInUserAccessToken).send({ 
            friendId : "hexaacbdef"
        })).rejects.toThrow()

    })
    })