import type { NextFunction, Request, Response } from "express";
import AppError from "../errorHelpers/AppError.js";

import { envVars } from "../config/env.js";
import type { JwtPayload } from "jsonwebtoken";
import { verifyToken } from "../utils/jwt.js";

export const checkAuth =
    (...authRoles: string[]) =>
        async (req: Request, res: Response, next: NextFunction) => {
            try {
                const accessToken = req.headers.authorization || req.cookies.accessToken;
                // console.log("accessToken", accessToken);
                if (!accessToken) {
                    throw new AppError(403, "No Token Received");
                }
                const verifiedToken = verifyToken(
                    accessToken,
                    envVars.JWT_ACCESS_SECRET,
                ) as JwtPayload;
                // console.log("authRoles:", authRoles);
                // console.log("token role:", verifiedToken.role);
                // console.log("includes:", authRoles.includes(verifiedToken.role));
                if (!authRoles.includes(verifiedToken.role.toUpperCase())) {
                    throw new AppError(403, "You are not permitted to view this route !!");
                }
                req.user = verifiedToken;
                next();
            } catch (error) {
                next(error);
            }
        };
