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
describe('tests the enable 2 factor authentication feature', () => {
    it("test if f2a is successfully enables", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield api.post("/auth-user/enable-f2a").type("form").send({
            email: "hamza@gmail.com",
        });
        expect(response.body).toEqual(expect.objectContaining({
            factor2AuthToken: expect.any(String)
        }));
    }));
});
describe("tests disable factor 2 auth feature", () => {
    it("if f2a is successfully disabled", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield api
            .delete(`/auth-user/disable-factor2Auth/${"1914f89e-aca2-4f6a-92c6-e8cb59e62935"}`);
        expect(response.status).toBe(200);
        expect(response.body).toBe("two factor authentication has been successfullly disabled");
    }));
});
describe("negative-case : tests factor2Auth faiure based on incorrect email", () => {
    it("if no email is provided", () => {
        expect(() => api.post("/auth-user/enable-f2a")).rejects.toThrow();
    });
});
