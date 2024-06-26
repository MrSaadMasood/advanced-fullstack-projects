import api, { loggedInUserAccessToken } from "../../jest.setup"

describe('tests the create new group functionlity', () => { 

    it("should create a new Group", async ()=>{

        const result = await api.post("/user/create-new-group").set("Authorization", loggedInUserAccessToken)
            .type("form")
            .send({
                members : JSON.stringify(["100020747428319565071", "f06ec470-49b4-4f90-bb87-93b078eea9e9"]),
                groupName : "testGroup"
            })
        
        
        expect(result.status).toBe(200)
        expect(result.body).toEqual({ message : "the group is successfully created"})
        
    })

    it("negative: should fail to crate a new group", async ()=> {

        const error = await api.post("/user/create-new-group").set("Authorization", loggedInUserAccessToken)
            .type("form")
            .send({
                members : JSON.stringify(["f06ec470-49b4-4f90-bb87-93b078eea9e9"]),
                groupName : "testGroup"
            })
        expect(error.status).toBe(400)
    })
 })