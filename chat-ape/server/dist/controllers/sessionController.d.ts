import { Request, Response } from 'express';
export declare function createUser(req: Request, res: Response): Promise<void | Response<any, Record<string, any>>>;
export declare function loginUser(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function refreshUser(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function logoutUser(req: Request, res: Response): Promise<void>;
export declare function googleAuthenticator(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function generateOTP(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function verifyOTP(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function enableF2a(req: Request, res: Response): Promise<void>;
export declare function disableFactor2Auth(req: Request, res: Response): Promise<void>;
