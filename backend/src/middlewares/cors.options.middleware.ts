import { NextFunction, Request, Response } from "express";
import cors from "cors"
import { NEXT_AUTH_SECRET_KEY, WHITELIST } from "../config/index.config";

export function corsOptions(req: Request, res: Response, next: NextFunction) {
    const nextAuthSecretKey = req?.headers['next-auth-secret-key'];

    if (nextAuthSecretKey === NEXT_AUTH_SECRET_KEY) {
        next();
    } else {
        cors({
            origin(requestOrigin, callback) {
                if (WHITELIST.indexOf(requestOrigin) !== -1) {
                    callback(null, true);
                } else {
                    callback(new Error('Not allowed by CORS'))
                }
            }
        }) (req, res, next);
    }

}