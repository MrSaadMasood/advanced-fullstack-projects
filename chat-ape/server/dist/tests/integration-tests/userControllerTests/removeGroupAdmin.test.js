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
describe('tests the remove admin from group funcationality', () => {
    it("should remove the admin of the group", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield api.delete("/user/remove-group-admin")
            .set("Authorization", loggedInUserAccessToken)
            .query({
            collectionId: "f7f29bde-6ffb-47f4-bdeb-2bd5019312cf",
            memberId: "f06ec470-49b4-4f90-bb87-93b078eea9e9"
        });
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: "the admin has been successfullly removed" });
    }));
    it('should fail to remove the admin', () => {
        expect(() => api.delete("/user/remove-group-admin")
            .set("Authorization", loggedInUserAccessToken)
            .query({
            collectionId: "f7f29bde-6ffb-47f4-bdeb-2bd5019312cf",
            memberId: "fake-admin"
        })).rejects.toThrow();
    });
});
