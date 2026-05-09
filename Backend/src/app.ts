import cors from "cors";
import express, { type Request, type Response } from "express";
import { router } from "./app/routes/index.js";
import { globalErrorHandler } from "./app/middlewares/globalErrorHandler.js";
import cookieParser from "cookie-parser";
import expressSession from "express-session";
import passport from "passport";
import "./app/config/passport.js";
import notFound from "./app/modules/auth/notFound.js";
import { envVars } from "./app/config/env.js";

// import { connectRedis } from "./app/config/redis.config.js";
const app = express();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
    expressSession({
        secret: "Your secret",
        resave: false,
        saveUninitialized: false,
    }),
);

app.use(passport.initialize());
app.use(passport.session());
app.set("trust proxy", 1);
app.use(
    cors({
        origin: envVars.FRONTEND_URL,
        credentials: true,
    }),
);

app.use("/api/v1", router);

app.get("/", (req: Request, res: Response) => {
    res.status(200).json({
        message: "Welcome to Tour Management System Backend!!!",
    });
});

app.use(globalErrorHandler);
app.use(notFound);
export default app;
