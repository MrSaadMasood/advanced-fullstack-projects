var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import api from "../../jest.setup";
import { sampleRefreshToken } from "../../testUtils";
describe('tests the logout functionality', () => {
    it("tests the logout route", () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield api.delete(`/auth-user/logout`).type("form").send({
            refreshToken: sampleRefreshToken
        });
        expect(result.status).toBe(200);
        expect(result.body).toBe("user successfully logged out");
    }));
    it("negative case: tests logout failure", () => {
        expect(() => api.delete(`/auth-user/logout`).type("form").send({
            refreshToken: "fake token"
        })).rejects.toThrow();
    });
});
