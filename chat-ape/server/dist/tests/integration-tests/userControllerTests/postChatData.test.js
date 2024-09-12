var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { BadRequest } from "../../../src/ErrorHandler/customError";
import api, { loggedInUserAccessToken } from "../../jest.setup";
describe('tests the update chat data functionality', () => {
    it("should update the normal chat data", () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield api.post(`/user/chat-data`).set("Authorization", loggedInUserAccessToken)
            .type("form").send({
            collectionId: "bc8c0ee9-a591-4def-b1ac-192fdcba6027", content: "testContent"
        });
        expect(result.status).toBe(200);
        expect(result.body).toHaveProperty("id", expect.any(String));
    }));
    it("negative: should fail to update the chat data", () => __awaiter(void 0, void 0, void 0, function* () {
        expect(() => api.post(`/user/chat-data`).set("Authorization", loggedInUserAccessToken)
            .type("form").send({
            collectionId: "hexaabcd", content: "testContent"
        })).rejects.toThrow(new BadRequest);
    }));
});
