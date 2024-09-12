var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import express from "express";
import supertest from "supertest";
import { dbConnection, dbDisconnect, googleTokens, googleUserIntermediaryToken, sampleRefreshToken, signUpWithGoogleCode } from "./testUtils";
import indexRouter from "../src/routes/authRouter";
import factor2AuthRouter from '../src/routes/factor2Router';
import { authenticateUser, factor2RouteTokenAuthenticator } from "../src/middlewares/AuthMiddlewares";
import userRouter from './../src/routes/userRouter';
import { errorMiddleware } from "../src/middlewares/errorMiddleware";
import "express-async-errors";
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/auth-user", indexRouter);
app.use("/factor2", factor2RouteTokenAuthenticator, factor2AuthRouter);
app.use("/user", authenticateUser, userRouter);
app.use(errorMiddleware);
const api = supertest(app);
let loggedInUserAccessToken;
jest.mock("../src/utils/googleTokenFuncs", () => {
    const original = jest.requireActual("../src/utils/googleTokenFuncs");
    return Object.assign(Object.assign({}, original), { refreshGoogleAccessToken: jest.fn((value) => {
            if (value === sampleRefreshToken || googleUserIntermediaryToken)
                return Promise.resolve(googleTokens);
            return Promise.reject();
        }), googleTokensExtractor: jest.fn((code) => {
            if (code === signUpWithGoogleCode)
                return Promise.resolve(googleTokens);
            return Promise.resolve(undefined);
        }) });
});
jest.mock("axios", () => {
    const originalAxios = jest.requireActual("axios");
    return Object.assign(Object.assign({}, originalAxios), { post: jest.fn().mockImplementation(() => {
            return Promise.resolve();
        }) });
});
jest.mock('../src/middlewares/multer', () => {
    return {
        upload: {
            single: jest.fn(() => (_req, _res, next) => {
                _req.file = Object.assign(Object.assign({}, _req.file), { filename: _req.body.image });
                next();
            })
        }
    };
});
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield dbConnection();
    const response = yield api.post("/auth-user/login").type("form").send({
        email: "saad@gmail.com",
        password: "Saad.Masood1122"
    });
    loggedInUserAccessToken = `Bearer ${response.body.accessToken}`;
}));
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield dbDisconnect();
}));
export default api;
export { loggedInUserAccessToken };
