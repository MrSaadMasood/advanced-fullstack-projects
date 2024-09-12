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
// const database = await dataBaseConnectionMaker(process.env.TEST_URI)
describe("tests the new user sign up functionality", () => {
    it("tests if the users is successfully created", () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield api.post("/auth-user/sign-up").type("form").send({
            fullName: "test",
            email: "test1@gmail.com",
            password: "Testing.1234",
            isGoogleUser: undefined,
            profilePicture: undefined,
            id: undefined
        });
        expect(result.status).toBe(200);
        expect(result.statusCode).toBe(200);
        expect(result.type).toBe("application/json");
        expect(result).toHaveProperty("_body", { message: "user successfully created" });
    }));
});
