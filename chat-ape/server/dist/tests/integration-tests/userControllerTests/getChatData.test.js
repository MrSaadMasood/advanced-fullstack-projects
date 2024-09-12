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
describe('tests /get-chat-data route', () => {
    it("should get the chat data", () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield api.get(`/user/get-chat/${"bc8c0ee9-a591-4def-b1ac-192fdcba6027"}`)
            .set("Authorization", loggedInUserAccessToken);
        expect(result.status).toBe(200);
        expect(result.body).toEqual(expect.objectContaining({
            _id: expect.any(String),
            chat: expect.any(Object)
        }));
        expect(result.body.chat[0]).toEqual(expect.objectContaining({
            id: expect.any(String),
            userId: expect.any(String),
        }));
    }));
    it('should fail to get the chat data', () => {
        expect(() => api.get(`/user/get-chat/${"hexaabcdef"}`).
            set("Authorization", loggedInUserAccessToken)).rejects.toThrow();
    });
});
