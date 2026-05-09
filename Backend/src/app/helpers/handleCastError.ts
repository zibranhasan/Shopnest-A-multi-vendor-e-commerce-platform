/* eslint-disable @typescript-eslint/no-unused-vars */
import mongoose from "mongoose";
import type { TGenericErrorResponse } from "../interfaces/error.types.js";

export const handleCastError = (
    err: mongoose.Error.CastError,
): TGenericErrorResponse => {
    return {
        statusCode: 400,
        message: "Invalid MongoDB ObjectID. Please provide a valid id",
    };
};
