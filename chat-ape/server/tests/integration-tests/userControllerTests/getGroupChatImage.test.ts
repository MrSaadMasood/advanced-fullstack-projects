import api, { loggedInUserAccessToken } from "../../jest.setup"


it("tests the /group-picture/:name route", async ()=>{

    const result = await api.get(`/user/group-picture/${"image-1710796984278681794967.jpg"}`)
        .set("Authorization", loggedInUserAccessToken)

    expect(result.status).toBe(200)
    expect(result.body.toString()).toEqual(expect.any(String))

})
