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
describe("tests refreshing the accesstoken functionality", () => {
    describe("refresh the token for normal user successfully", () => {
        it("refresh normal user token", () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield api.post("/auth-user/refresh").type("form").send({
                refreshToken: sampleRefreshToken,
                isGoogleUser: undefined
            });
            expect(result.status).toBe(200);
            expect(result.body).toEqual(expect.objectContaining({
                newAccessToken: expect.any(String)
            }));
        }));
    });
    describe("tests refreshing the googler user token successfully", () => {
        it("tests refreshing the google usr refresh token", () => __awaiter(void 0, void 0, void 0, function* () {
            const googleRefreshPath = yield api.post("/auth-user/refresh").type("form").send({
                refreshToken: sampleRefreshToken,
                isGoogleUser: true
            });
            expect(googleRefreshPath).resolves;
            expect(googleRefreshPath.status).toBe(200);
            expect(googleRefreshPath.body).toEqual(expect.objectContaining({
                newAccessToken: expect.any(String)
            }));
        }));
    });
    describe("fails to refresh the normal user token", () => {
        it("for normal user", () => {
            expect(() => api.post("/auth-user/refresh").type("form").send({
                refreshToken: "fakeToken"
            })).rejects.toThrow();
        });
    });
    describe("failes to refresh the google user token", () => {
        it("for google user", () => {
            expect(() => api.post("/auth-user/refresh").type("form").send({
                refreshToken: "fakeToken",
                isGoogleUser: true
            })).rejects.toThrow();
        });
    });
});
