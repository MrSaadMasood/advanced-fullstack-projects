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
describe('tests the /group-chats list route', () => {
    it("should get the group chat list", () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield api.get("/user/group-chats").set("Authorization", loggedInUserAccessToken);
        expect(result.status).toBe(200);
        expect(result.body).toEqual(expect.any(Object));
        expect(result.body[0]).toEqual(expect.objectContaining({
            groupName: expect.any(String),
            senderName: expect.any(String)
        }));
    }));
});
