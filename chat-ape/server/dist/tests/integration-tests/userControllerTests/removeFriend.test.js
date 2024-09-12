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
describe('tests the /remove-friend route', () => {
    it("shoudl remove the friend", () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield api.delete(`/user/remove-friend/${"100020747428319565071"}`)
            .set("Authorization", loggedInUserAccessToken)
            .query({
            collectionId: "cecc24b3-878e-41ca-815f-5fb84e5f68b2"
        });
        expect(result.status).toBe(200);
        expect(result.body).toEqual({ message: "successfully removed friend" });
    }));
    it('should fail to remove the friend', () => {
        expect(() => api.delete(`/user/remove-friend/${"hexaabcdef"}`)
            .set("Authorization", loggedInUserAccessToken).query({ collectionId: "" })).rejects.toThrow();
    });
});
