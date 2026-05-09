import httpStatus from "http-status-codes";
import { type Request, type Response } from "express";

const notFound = (req: Request, res: Response) => {
    res.status(httpStatus.NOT_FOUND).json({
        success: false,
        message: "Route Not Found",
    });
};

export default notFound;
