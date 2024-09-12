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
describe("tests the login functionality", () => {
    describe("tests the successfull login", () => {
        it("tests the normal user login route", () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield api.post("/auth-user/login").type("form").send({
                email: "ammar@gmail.com",
                password: "Ammar.Masood1122",
            });
            expect(result.status).toBe(200);
            expect(result.statusCode).toBe(200);
            expect(result.type).toBe("application/json");
            expect(result.body).toEqual(expect.objectContaining({
                accessToken: expect.any(String),
                refreshToken: expect.any(String)
            }));
        }));
        it("tests the user logging in from google accound", () => __awaiter(void 0, void 0, void 0, function* () {
            const is2FactorRoute = yield api.post("/auth-user/login").type("form").send({
                email: "tester@gmail.com",
                password: "Tester.123"
            });
            expect(is2FactorRoute.body).toEqual(expect.objectContaining({
                is2FactorAuthEnabled: true
            }));
        }));
    });
    describe("tests the login failure on incorrct credentials", () => {
        it("tests if the user which does not exist in the database", () => {
            expect(() => api.post("/auth-user/login").type("form").send({
                email: "randomDude@gmail.com",
                password: "Random.123"
            })).rejects.toThrow();
        });
        it("tests the wrong password login try", () => {
            expect(() => api.post("/auth-user/login").type("form").send({
                email: "ammar@gmail.com",
                password: "Random.123"
            })).rejects.toThrow("password do not match");
        });
    });
});
