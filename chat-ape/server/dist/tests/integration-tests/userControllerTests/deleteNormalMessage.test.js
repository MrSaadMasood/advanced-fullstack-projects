var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import api, { loggedInUserAccessToken } from "../../jest.setup";
describe('test the message deletion from normal chats', () => {
    it("should remove the message from the normal chat", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield api.delete(`/user/delete-message`)
            .set("Authorization", loggedInUserAccessToken)
            .query({
            collectionId: "bc8c0ee9-a591-4def-b1ac-192fdcba6027",
            type: "normal",
            messageId: "5083ddc1-0efb-429c-97c0-d8723b09addb"
        });
        expect(response.status).toBe(200);
        expect(response.body).toBe("message successfully deleted");
    }));
    it("negative : should fail to remove message from normal chats", () => {
        expect(() => api.delete(`/user/delete-message`)
            .set("Authorization", loggedInUserAccessToken)
            .query({
            collectionId: "randomNormalChatsCollection",
            type: "normal",
            messageId: "5083ddc1-0efb-429c-97c0-d8723b09addb"
        })).rejects.toThrow();
    });
});
