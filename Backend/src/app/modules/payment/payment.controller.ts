import type { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { PaymentService } from "./payment.service.js";
import { envVars } from "../../config/env.js";
import type { JwtPayload } from "jsonwebtoken";

const initPayment = catchAsync(async (req: Request, res: Response) => {
    const orderId = req.params.orderId as string;
    const customerId = (req.user as JwtPayload).userId;
    const result = await PaymentService.initPayment(orderId, customerId);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Payment initialized successfully",
        data: result,
    });
});

const successPayment = catchAsync(async (req: Request, res: Response) => {
    const result = await PaymentService.successPayment(req.query as Record<string, string>);

    if (result.success) {
        res.redirect(
            `${envVars.SSL.SSL_SUCCESS_FRONTEND_URL}?transactionId=${req.query.transactionId}&status=success`
        );
    }
});

const failPayment = catchAsync(async (req: Request, res: Response) => {
    await PaymentService.failPayment(req.query as Record<string, string>);

    res.redirect(
        `${envVars.SSL.SSL_FAIL_FRONTEND_URL}?transactionId=${req.query.transactionId}&status=fail`
    );
});

const cancelPayment = catchAsync(async (req: Request, res: Response) => {
    await PaymentService.cancelPayment(req.query as Record<string, string>);

    res.redirect(
        `${envVars.SSL.SSL_CANCEL_FRONTEND_URL}?transactionId=${req.query.transactionId}&status=cancel`
    );
});

export const PaymentControllers = {
    initPayment,
    successPayment,
    failPayment,
    cancelPayment,
};
