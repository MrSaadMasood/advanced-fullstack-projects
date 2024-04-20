import api, { loggedInUserAccessToken } from "../../jest.setup"

    it("form the groupChats collectoin", async () => {

        const response = await api.delete(`/user/delete-message`)
            .set("Authorization", loggedInUserAccessToken)
            .query({
                collectionId : "f7f29bde-6ffb-47f4-bdeb-2bd5019312cf",
                type : "group",
                messageId : "f1d1b10-1930-4116-9aaa-b36ed8da79a8"
            })
        
        expect(response.status).toBe(200)
        expect(response.body).toBe("message successfully deleted")
        
        expect(() => api.delete(`/user/delete-message`)
            .set("Authorization", loggedInUserAccessToken)
            .query({
                collectionId : "randomGroupChatsCollection",
                type : "group",
                messageId : "5083ddc1-0efb-429c-97c0-d8723b09addb"
            })).rejects.toThrow()
    })