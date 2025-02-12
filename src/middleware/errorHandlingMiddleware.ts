import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/handlers/apiError";
import { time } from "console";

export const errorHandlerMiddleware = (
  err: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  const details = err.errors || null;

  const response = {
    status: "error",
    statusCode: statusCode,
    message: message,
    ...(details && { details }),
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    timestamp: new Date().toISOString(),
  };

  res.status(statusCode).json(response);
};
