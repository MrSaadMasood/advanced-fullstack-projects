var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { fileValidator, generateAccessRefreshTokens } from "../../src/utils/utils";
const database = {
    collection: jest.fn().mockImplementation(() => ({
        insertOne: jest.fn().mockResolvedValue(true)
    }))
};
describe('tests the functions in the utils directory', () => {
    it("tests the file validator", () => __awaiter(void 0, void 0, void 0, function* () {
        const isFile = fileValidator({ filename: "testFile" });
        expect(isFile).toBe("testFile");
    }));
    it('negative:1 tests the failure of file validator', () => {
        expect(() => fileValidator(undefined)).toThrow();
    });
});
describe('tests the  generateAccessRefreshTokens function', () => {
    it('should generate the access and refresh tokens ', () => __awaiter(void 0, void 0, void 0, function* () {
        const tokens = yield generateAccessRefreshTokens({ id: "1122" }, database);
        expect(tokens).toEqual(expect.objectContaining({
            accessToken: expect.any(String),
            refreshToken: expect.any(String),
        }));
    }));
});
