import { UserRefreshClient } from "google-auth-library"
import oAuth2Client from "./oAuth2Client.js"
import env from "../zodSchema/envSchema.js"

const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = env

async function googleTokensExtractor(code : string){
        const { tokens} = await oAuth2Client.getToken(code)
        return tokens
}

async function refreshGoogleAccessToken(refreshToken : string){
        const userRefresh = new UserRefreshClient(
            GOOGLE_CLIENT_ID,
            GOOGLE_CLIENT_SECRET,
            refreshToken
        )
        const { credentials } = await userRefresh.refreshAccessToken()
        return credentials
}

export {
    googleTokensExtractor,
    refreshGoogleAccessToken
}