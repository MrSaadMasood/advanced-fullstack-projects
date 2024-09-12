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
describe('test the add friend to group functionlity', () => {
    it("should add friend to the Group", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield api.put("/user/add-group-member")
            .set("Authorization", loggedInUserAccessToken)
            .type("form")
            .send({
            collectionId: "f7f29bde-6ffb-47f4-bdeb-2bd5019312cf",
            friendId: "1914f89e-aca2-4f6a-92c6-e8cb59e62935"
        });
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: "friend successfulllye added to group" });
    }));
});
