var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { UserRefreshClient } from "google-auth-library";
import oAuth2Client from "./oAuth2Client.js";
import env from "../zodSchema/envSchema.js";
const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = env;
function googleTokensExtractor(code) {
    return __awaiter(this, void 0, void 0, function* () {
        const { tokens } = yield oAuth2Client.getToken(code);
        return tokens;
    });
}
function refreshGoogleAccessToken(refreshToken) {
    return __awaiter(this, void 0, void 0, function* () {
        const userRefresh = new UserRefreshClient(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, refreshToken);
        const { credentials } = yield userRefresh.refreshAccessToken();
        return credentials;
    });
}
export { googleTokensExtractor, refreshGoogleAccessToken };
