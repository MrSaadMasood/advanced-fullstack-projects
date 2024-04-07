import { Request, Response, NextFunction } from 'express';
declare const stringValidation: (string: string) => import("express-validator").ValidationChain;
declare const booleanValidation: (value: string) => import("express-validator").ValidationChain;
declare const queryValidation: (type: string) => import("express-validator").ValidationChain;
declare const paramValidation: (type: string) => import("express-validator").ValidationChain;
declare function authenticateUser(req: Request, res: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>>;
declare function factor2RouteTokenAuthenticator(req: Request, res: Response, next: NextFunction): Promise<void>;
declare function googleTokensExtractor(code: string): Promise<import("google-auth-library").Credentials>;
declare function refreshGoogleAccessToken(refreshToken: string): Promise<import("google-auth-library").Credentials>;
export { authenticateUser, factor2RouteTokenAuthenticator, googleTokensExtractor, refreshGoogleAccessToken, stringValidation, booleanValidation, queryValidation, paramValidation };
