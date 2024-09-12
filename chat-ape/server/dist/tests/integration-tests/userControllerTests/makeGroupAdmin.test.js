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
describe('tests the make a member admin funcationality', () => {
    it("should make the member admin", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield api.put("/user/make-member-admin")
            .set("Authorization", loggedInUserAccessToken)
            .type("form")
            .send({
            collectionId: "f7f29bde-6ffb-47f4-bdeb-2bd5019312cf",
            memberId: "100020747428319565071"
        });
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: "successfully made admin" });
    }));
});
