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
import { authenticator } from 'otplib';
import { googleUserIntermediaryToken, intermediaryToken } from "../../testUtils";
describe("tests the qrcode generation functionality", () => {
    it("qr code successfully generated", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield api.get("/factor2/generate-otp").set("Authorization", intermediaryToken);
        expect(response.status).toBe(200);
        expect(response.body.startsWith("data")).toEqual(true);
    }));
});
describe("tests the verification of otp", () => {
    beforeAll(() => {
        jest.spyOn(authenticator, "check").mockImplementation(() => (true));
    });
    afterAll(() => jest.clearAllMocks());
    it("otp is successfully verified for normal user", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield api.post("/factor2/verify-otp").set("Authorization", intermediaryToken).send({
            otp: "1212",
            refreshToken: intermediaryToken,
            isGoogleUser: false
        });
        expect(response.status).toBe(200);
        expect(response.body).toEqual(expect.objectContaining({
            isGoogleUser: false,
            refreshToken: expect.any(String),
            accessToken: expect.any(String),
            is2FactorAuthEnabled: true
        }));
    }));
    it("otp is verified for the google user", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield api.post("/factor2/verify-otp").set("Authorization", googleUserIntermediaryToken).send({
            otp: "1212",
            refreshToken: googleUserIntermediaryToken,
        });
        expect(response.status).toBe(200);
        expect(response.body).toEqual(expect.objectContaining({
            isGoogleUser: true,
            refreshToken: expect.any(String),
            accessToken: "google access token",
            is2FactorAuthEnabled: true
        }));
    }));
});
