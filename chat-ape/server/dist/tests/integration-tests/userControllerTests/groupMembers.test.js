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
describe('tests the get group members functionality', () => {
    it("should get all the members of the group", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield api.get(`/user/group-members/${"f7f29bde-6ffb-47f4-bdeb-2bd5019312cf"}`)
            .set("Authorization", loggedInUserAccessToken);
        expect(response.status).toBe(200);
        expect(response.body[0]).toEqual(expect.objectContaining({
            _id: expect.any(String),
            fullName: expect.any(String)
        }));
    }));
    it('negative: should fail to get the members', () => {
        expect(() => api.get(`/user/group-members/${"ranodmGroupId"}`)
            .set("Authorization", loggedInUserAccessToken)).rejects.toThrow();
    });
});
