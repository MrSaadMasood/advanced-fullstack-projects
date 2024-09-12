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
describe('test the delete message from group functionlity', () => {
    it("remove the message from the group", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield api.delete(`/user/delete-message`)
            .set("Authorization", loggedInUserAccessToken)
            .query({
            collectionId: "f7f29bde-6ffb-47f4-bdeb-2bd5019312cf",
            type: "group",
            messageId: "f1d1b10-1930-4116-9aaa-b36ed8da79a8"
        });
        expect(response.status).toBe(200);
        expect(response.body).toBe("message successfully deleted");
    }));
    it("negative: should fail to remove message", () => {
        expect(() => api.delete(`/user/delete-message`)
            .set("Authorization", loggedInUserAccessToken)
            .query({
            collectionId: "randomGroupChatsCollection",
            type: "group",
            messageId: "5083ddc1-0efb-429c-97c0-d8723b09addb"
        })).rejects.toThrow();
    });
});
