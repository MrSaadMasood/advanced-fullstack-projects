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
describe('tests the /get-group-chat route', () => {
    it("should get the group chat data", () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield api.get(`/user/get-group-chat/${"f7f29bde-6ffb-47f4-bdeb-2bd5019312cf"}`)
            .set("Authorization", loggedInUserAccessToken);
        expect(result.status).toBe(200);
        expect(result.body).toEqual(expect.any(Object));
        expect(result.body[0]).toEqual(expect.objectContaining({
            senderName: expect.any(String),
            chat: expect.any(Object)
        }));
    }));
});
