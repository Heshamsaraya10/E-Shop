import { ErrorRequestHandler, Request, Response, NextFunction } from "express";
import ApiError from "../utils/apiError";

interface CustomError extends Error {
  statusCode?: number;
  status?: string;
  stack?: string;
}

const handleJwtInvalidSignature = (): ApiError =>
  new ApiError("Invalid token, please login again..", 401);

const handleJwtExpired = (): ApiError =>
  new ApiError("Expired token, please login again..", 401);
  
const globalError: ErrorRequestHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  if (process.env.NODE_ENV === "development") {
    sendErrorForDev(err, res);
  } else {
    if (err.name === "JsonWebTokenError") err = handleJwtInvalidSignature();
    if (err.name === "TokenExpiredError") err = handleJwtExpired();
    sendErrorForProd(err, res);
  }
};

const sendErrorForDev = (err: CustomError, res: Response): Response => {
  const statusCode = err.statusCode || 500;
  return res.status(statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorForProd = (err: CustomError, res: Response): Response => {
  const statusCode = err.statusCode || 500;
  return res.status(statusCode).json({
    status: err.status,
    message: err.message,
  });
};

export default globalError;
