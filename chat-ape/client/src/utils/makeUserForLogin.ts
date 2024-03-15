import { UserSaved } from "../Types/dataTypes";

function makeUserForLogin(accessToken : string, refreshToken : string, isGoogleUser : boolean): UserSaved {
    return {
        isGoogleUser,
        accessToken,
        refreshToken
    }
}