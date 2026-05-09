import mongoose from "mongoose";
import type {
    TErrorSources,
    TGenericErrorResponse,
} from "../interfaces/error.types.js";

/* eslint-disable @typescript-eslint/no-explicit-any */
export const handlerValidationError = (
    err: mongoose.Error.ValidationError,
): TGenericErrorResponse => {
    const errorSources: TErrorSources[] = [];

    const errors = Object.values(err.errors);

    errors.forEach((errorObject: any) =>
        errorSources.push({
            path: errorObject.path,
            message: errorObject.message,
        }),
    );

    return {
        statusCode: 400,
        message: "Validation Error",
        errorSources,
    };
};
