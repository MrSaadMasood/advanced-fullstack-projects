import { Db } from "mongodb";
declare function generateAccessRefreshTokens(user: tokenUser, database: Db): Promise<{
    accessToken: string;
    refreshToken: string;
}>;
declare function envValidator(env: string | undefined, envName: string): string;
export { generateAccessRefreshTokens, envValidator };
