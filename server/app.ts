import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { ErrorMiddleware } from "./middleware/error";
import authRoutes from './routes/authRoute'

export const app = express();
require("dotenv").config;

//body parser
app.use(express.json({ limit: "50mb" }));

//cookie parser
app.use(cookieParser());

//cors
app.use(
  cors({
    origin: process.env.ORIGIN,
  })
);

//testing api
app.get("/test", (req: Request, res: Response, next: NextFunction) => {
  return res.status(200).json({ message: "api is working", success: true });
});

//routes
app.use("/api/v1/auth", authRoutes)


//unknown route
app.all("*", (req: Request, res: Response, next: NextFunction) => {
  const err = new Error(`Route ${req.originalUrl} Not Found`) as any;
  (err.statusCode = 404), next(err);
});

app.use(ErrorMiddleware);