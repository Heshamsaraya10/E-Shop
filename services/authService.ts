import crypto from "crypto";
import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import bcrypt from "bcrypt";
import asyncHandler from "express-async-handler";
import ApiError from "../utils/apiError";

import User from "../models/userModel";
import sendEmail from "../utils/sendEmail";
import createToken from "../utils/createToken";

declare global {
  namespace Express {
    interface Request {
      user?: Record<string, any>;
    }
  }
}

// @desc    Signup
// @route   GET /api/v1/auth/signup
// @access  Public
export const signup = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // 1- Create user
    const user = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
    });
    // 2- Generate token
    const token = createToken(user._id);

    res.status(201).json({ data: user, token });
  }
);

// @desc    Login
// @route   GET /api/v1/auth/login
// @access  Public
export const login = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // 1) check if password and email in the body (validation)
    // 2) check if user exist & check if password is correct
    const user = await User.findOne({ email: req.body.email });

    if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
      return next(new ApiError("Incorrect email or password", 401));
    }
    // 3) generate token
    const token = createToken(user._id);
    // 4) send response to client sid
    res.status(201).json({ data: user, token });
  }
);

// @desc   make sure the user is logged in
export const protect = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // 1) Check if token exist, if exist get
    let token: string | undefined;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }
    if (!token) {
      return next(
        new ApiError(
          "You are not login, Please login to get access this route",
          401
        )
      );
    }

    // 2) Verify token (no change happens, expired token)
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET_KEY || "fallback_secret_key"
    ) as JwtPayload;

    // 3) Check if user exists
    const currentUser = await User.findById(decoded.userId);
    if (!currentUser) {
      return next(
        new ApiError(
          "The user that belong to this token does no longer exist",
          401
        )
      );
    }

    // 4) Check if user change his password after token created
    if (
      currentUser.passwordChangedAt &&
      decoded &&
      typeof decoded.iat === "number"
    ) {
      const passChangedTimestamp: number = Math.floor(
        currentUser.passwordChangedAt.getTime() / 1000
      );

      // Password changed after token creation (Error)
      if (passChangedTimestamp > decoded.iat) {
        return next(
          new ApiError(
            "User recently changed their password. Please log in again.",
            401
          )
        );
      }
    }

    req.user = currentUser;
    next();
  }
);

// @desc    Authorization (User Permissions)
export const allowedTo = (...roles: string[]) =>
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    // 1) access roles
    // 2) access registered user (req.user.role)
    if (!roles.includes(req.user?.role)) {
      return next(
        new ApiError("You are not allowed to access this route", 403)
      );
    }
    next();
  });

// @desc    Forgot password
// @route   POST /api/v1/auth/forgotPassword
// @access  Public
export const forgotPassword = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // 1) Get user by email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return next(
        new ApiError(`There is no user with that email ${req.body.email}`, 404)
      );
    }

    // 2) If user exist, Generate hash reset random 6 digits and save it in db
    const resetCode: string = Math.floor(
      100000 + Math.random() * 900000
    ).toString();
    const hashedResetCode: string = crypto
      .createHash("sha256")
      .update(resetCode)
      .digest("hex");
    // Save hashed password reset code into db
    user.passwordResetCode = hashedResetCode;
    // Add expiration time for password reset code (10 min)
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000;
    user.passwordResetVerified = false;

    await user.save();

    // 3) Send the reset code via email
    const message: string = `Hi ${user.name},\n We received a request to reset the password on your E-shop Account. \n ${resetCode} \n Enter this code to complete the reset. \n Thanks for helping us keep your account secure.\n The E-shop Team`;

    try {
      await sendEmail({
        email: user.email,
        subject: "Your password reset code (valid for 10 min)",
        message,
      });
    } catch (err) {
      user.passwordResetCode = undefined;
      user.passwordResetExpires = undefined;
      user.passwordResetVerified = undefined;

      await user.save();
      return next(new ApiError("There is an error in sending email", 500));
    }
    res
      .status(200)
      .json({ status: "Success", message: "Reset code sent to email" });
  }
);

// @desc    Verify password reset code
// @route   POST /api/v1/auth/verifyResetCode
// @access  Public
export const verifyPassResetCode = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // 1) Get user based on reset code
    const hashedResetCode: string = crypto
      .createHash("sha256")
      .update(req.body.resetCode)
      .digest("hex");

    const user = await User.findOne({
      passwordResetCode: hashedResetCode,
      passwordResetExpires: { $gt: Date.now() },
    });
    if (!user) {
      return next(new ApiError("Reset code invalid or expired", 400));
    }
    // 2) Reset code valid
    user.passwordResetVerified = true;
    await user.save();

    res.status(200).json({
      status: "Success",
    });
  }
);

// @desc    Reset password
// @route   POST /api/v1/auth/resetPassword
// @access  Public
export const resetPassword = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // 1) Get user based on email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return next(
        new ApiError(`There is no user with email ${req.body.email}`, 404)
      );
    }
    // 2) Check if reset code verified
    if (!user.passwordResetVerified) {
      return next(new ApiError("Reset code not verified", 400));
    }
    user.password = req.body.newPassword;
    user.passwordResetCode = undefined;
    user.passwordResetExpires = undefined;
    user.passwordResetVerified = undefined;

    await user.save();
    // 3) if everything is ok, generate token
    const token = createToken(user._id);
    res.status(200).json({ token });
  }
);
