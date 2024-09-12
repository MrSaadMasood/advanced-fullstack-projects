var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import fs from "fs/promises";
import api, { loggedInUserAccessToken } from "../../jest.setup";
describe('tests the delete profile picture functionality', () => {
    beforeAll(() => {
        jest.spyOn(fs, "unlink").mockImplementation(() => Promise.resolve());
    });
    afterAll(() => jest.clearAllMocks());
    it("should delete the profile picture", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield api.delete(`/user/delete-previous-profile-picture/${"randomProfilePicture"}`)
            .set("Authorization", loggedInUserAccessToken);
        expect(response.status).toBe(200);
    }));
});
