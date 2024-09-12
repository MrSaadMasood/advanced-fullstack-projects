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
describe('test the adding the images to chats', () => {
    it("tests the /add-chat-image route", () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield api.post("/user/add-chat-image").set("Authorization", loggedInUserAccessToken)
            .send({
            collectionId: "bc8c0ee9-a591-4def-b1ac-192fdcba6027",
            image: "testFile"
        });
        expect(result.status).toBe(200);
        expect(result.body).toHaveProperty("filename", expect.any(String));
    }));
    it("tests the /add-group-chat-image route", () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield api.post("/user/add-group-chat-image").set("Authorization", loggedInUserAccessToken)
            .type("form")
            .send({
            groupId: "f7f29bde-6ffb-47f4-bdeb-2bd5019312cf",
            image: "testImage"
        });
        expect(result.status).toBe(200);
        expect(result.body).toHaveProperty("filename", expect.any(String));
        expect(() => api.post("/user/add-group-chat-image").set("Authorization", loggedInUserAccessToken)
            .type("form")
            .send({
            groupId: "f7f29bde-6ffb-47f4-bdeb-2bd5019312cf",
        })).rejects.toThrow();
    }));
});
