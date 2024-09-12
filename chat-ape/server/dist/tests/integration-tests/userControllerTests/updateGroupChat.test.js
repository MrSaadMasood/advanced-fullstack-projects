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
describe('tests the /group-data route', () => {
    it("update the group chat data", () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield api.post("/user/group-data").set("Authorization", loggedInUserAccessToken)
            .type("form")
            .send({
            groupId: "f7f29bde-6ffb-47f4-bdeb-2bd5019312cf",
            content: "test content"
        });
        expect(result.status).toBe(200);
        expect(result.body).toEqual({ id: expect.any(String) });
    }));
    it('should fail to update the group chat data', () => {
        expect(() => api.post("/user/group-data").set("Authorization", loggedInUserAccessToken)
            .type("form")
            .send({
            groupId: "randomgorup1234",
            content: "test content"
        })).rejects.toThrow();
    });
});
