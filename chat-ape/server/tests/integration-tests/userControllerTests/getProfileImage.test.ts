import api, { loggedInUserAccessToken } from "../../jest.setup"


it(`tests the /get-profile-picture route`, async ()=>{
    const result = await api.get(`/user/get-profile-picture/${"image-1707832479957193746767.jpg"}`)
        .set("Authorization", loggedInUserAccessToken)
    
    expect(result.status).toBe(200)
    expect(result.body.toString()).toEqual(expect.any(String))
})