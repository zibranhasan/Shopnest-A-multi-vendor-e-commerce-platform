import type { Request, Response, NextFunction } from "express";
import { catchAsync } from "../../utils/catchAsync.js";
import passport from "passport";
import AppError from "../../errorHelpers/AppError.js";
import { createUserTokens } from "../../utils/userTokens.js";
import { setAuthCookie } from "../../utils/setCookie.js";
import { sendResponse } from "../../utils/sendResponse.js";
import httpStatus from "http-status-codes";
import { AuthServices } from "./auth.service.js";
import type { JwtPayload } from "jsonwebtoken";
import { envVars } from "../../config/env.js";

const credentialsLogin = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        passport.authenticate("local", async (err: any, user: any, info: any) => {
            if (err) {
                // ❌❌❌❌❌
                // throw new AppError(401, "Some error")
                // next(err)
                // return new AppError(401, err)

                // ✅✅✅✅
                // return next(err)
                // console.log("from err");
                return next(new AppError(401, err));
            }

            if (!user) {
                // console.log("from !user");
                // return new AppError(401, info.message)
                return next(new AppError(401, info.message));
            }

            const userTokens = createUserTokens(user);

            // delete user.toObject().password

            const { password: pass, ...rest } = user.toObject();

            setAuthCookie(res, userTokens);

            sendResponse(res, {
                success: true,
                statusCode: httpStatus.OK,
                message: "User Logged In Successfully",
                data: {
                    accessToken: userTokens.accessToken,
                    refreshToken: userTokens.refreshToken,
                    user: rest,
                },
            });
        })(req, res, next);
    },
);

const getNewAccessToken = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            throw new AppError(
                httpStatus.BAD_REQUEST,
                "No refresh token recieved from cookies",
            );
        }
        const tokenInfo = await AuthServices.getNewAccessToken(
            refreshToken as string,
        );

        // res.cookie("accessToken", tokenInfo.accessToken, {
        //     httpOnly: true,
        //     secure: false
        // })

        setAuthCookie(res, tokenInfo);

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "New Access Token Retrived Successfully",
            data: tokenInfo,
        });
    },
);

const logout = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        res.clearCookie("accessToken", {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
        });
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
        });

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "User Logged Out Successfully",
            data: null,
        });
    },
);

const changePassword = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const { oldPassword, newPassword } = req.body || {};

        if (!oldPassword || !newPassword) {
            throw new AppError(httpStatus.BAD_REQUEST, "Old password and new password are required");
        }

        const decodedToken = req.user;

        await AuthServices.changePassword(
            oldPassword,
            newPassword,
            decodedToken as JwtPayload,
        );

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Password Changed Successfully",
            data: null,
        });
    },
);

const resetPassword = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const decodedToken = req.user;

        await AuthServices.resetPassword(req.body || {}, decodedToken as JwtPayload);

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Password Changed Successfully",
            data: null,
        });
    },
);

const googleCallbackController = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        let redirectTo = req.query.state ? (req.query.state as string) : "";

        if (redirectTo.startsWith("/")) {
            redirectTo = redirectTo.slice(1);
        }

        const user = req.user;

        if (!user) {
            throw new AppError(httpStatus.NOT_FOUND, "User Not Found");
        }

        const tokenInfo = createUserTokens(user);

        setAuthCookie(res, tokenInfo);

        res.redirect(`${envVars.FRONTEND_URL}/${redirectTo}`);
    },
);

const setPassword = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const decodedToken = req.user as JwtPayload;
        const { password } = req.body;

        await AuthServices.setPassword(decodedToken.userId, password);

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Password Changed Successfully",
            data: null,
        });
    },
);

const forgotPassword = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const { email } = req.body || {};

        await AuthServices.forgotPassword(email);

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Email Sent Successfully",
            data: null,
        });
    },
);
export const AuthControllers = {
    credentialsLogin,
    getNewAccessToken,
    logout,
    changePassword,
    resetPassword,
    setPassword,
    googleCallbackController,
    forgotPassword,
};
