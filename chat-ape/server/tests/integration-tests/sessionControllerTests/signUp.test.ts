import api from "../../jest.setup";
// const database = await dataBaseConnectionMaker(process.env.TEST_URI)

describe("tests the new user sign up functionality", ()=>{

    it("tests if the users is successfully created", async ()=>{
        const result = await api.post("/auth-user/sign-up").type("form").send({
            fullName : "test",
            email : "test1@gmail.com",
            password : "Testing.1234",
            isGoogleUser : undefined,
            profilePicture  : undefined,
            id : undefined
        })
        expect(result.status).toBe(200)
        expect(result.statusCode).toBe(200)
        expect(result.type).toBe("application/json")
        expect(result).toHaveProperty("_body", { message : "user successfully created"})
})
})
