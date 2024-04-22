import api, { loggedInUserAccessToken } from "../../jest.setup"

it(`tests the /get-chat-image route`, async ()=>{
    const result = await api.get(`/user/get-chat-image/${"image-1711029108628637763470.jpg"}`)
        .set("Authorization", loggedInUserAccessToken)
    
    expect(result.status).toBe(200)
    expect(result.body.toString()).toEqual(expect.any(String))
})