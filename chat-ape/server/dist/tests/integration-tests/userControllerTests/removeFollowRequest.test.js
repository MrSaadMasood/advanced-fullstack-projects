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
describe('tests the /remove-follow-request route', () => {
    it("should romove the follow request", () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield api.delete(`/user/remove-follow-request/${"28a2c354-3958-4a29-94c7-1440908dcd7f"}`)
            .set("Authorization", loggedInUserAccessToken);
        expect(result.status).toBe(200);
        expect(result.body).toEqual({ message: "successfully removed follow request" });
    }));
    it('negative: should fail to remove the follow request', () => {
        expect(() => api.delete(`/user/remove-follow-request/${"hexaabcdef"}`)
            .set("Authorization", loggedInUserAccessToken))
            .rejects.toThrow();
    });
});
