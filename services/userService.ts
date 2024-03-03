import { Request, Response, NextFunction } from "express";
import asyncHandler from "express-async-handler";
import bcrypt from "bcrypt";

import createToken from "../utils/createToken";

import User from "../models/userModel";
import ApiError from "../utils/apiError";
import {
  deleteOne,
  updateOne,
  createOne,
  getOne,
  getAll,
} from "./handlersFactory";

// // @desc    Get list of users
// // @route   GET /api/v1/users
// // @access  Public
export const getUsers = getAll(User);

// // @dec    GET specific users by id
// // @route  GET /api/v1/users/:id
// // @access public
export const getUser = getOne(User);
// //@dec    Create user
// //@route  POST /api/v1/users
// //@access private/Admin
export const createUser = createOne(User);

// // @desc    Update specific user
// // @route   PUT /api/v1/users/:id
// // @access  Private/Admin
export const updateUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const document = await User.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        slug: req.body.slug,
        phone: req.body.phone,
        email: req.body.email,
        profileImg: req.body.profileImg,
        role: req.body.role,
      },
      {
        new: true,
      }
    );
    if (!document) {
      return next(
        new ApiError(`No document for this id ${req.params.id}`, 404)
      );
    }
    res.status(200).json({ data: document });
  }
);

export const changeUserPassword = asyncHandler(async (req, res, next) => {
  const document = await User.findByIdAndUpdate(
    req.params.id,
    {
      password: await bcrypt.hash(req.body.password, 12),
      passwordChangedAt: Date.now(),
    },
    {
      new: true,
    }
  );

  if (!document) {
    return next(new ApiError(`No document for this id ${req.params.id}`, 404));
  }
  res.status(200).json({ data: document });
});
// @desc    Delete specific user
// @route   DELETE /api/v1/users/:id
// @access  Private
export const deleteUser = deleteOne(User);

// @desc    Get Logged user data
// @route   GET /api/v1/users/getMe
// @access  Private/Protect
export const getLoggedUserData = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    req.params.id = (req.user as { _id: string })._id;
    next();
  }
);

// @desc    Update logged user password
// @route   PUT /api/v1/users/updateMyPassword
// @access  Private/Protect
export const updateLoggedUserPassword = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // 1) Update user password based user payload (req.user._id)
    const user = await User.findByIdAndUpdate(
      (req.user as { _id: string })._id,
      {
        password: await bcrypt.hash(req.body.password, 12),
        passwordChangedAt: Date.now(),
      },
      {
        new: true,
      }
    );
    // 2) Generate token
    const token = createToken(user?._id);

    res.status(200).json({ data: user, token });
  }
);

// @desc    Update logged user data (without password, role)
// @route   PUT /api/v1/users/updateMe
// @access  Private/Protect
export const updateLoggedUserData = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const updatedUser = await User.findByIdAndUpdate(
      (req.user as { _id: string })._id,
      {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
      },
      { new: true }
    );

    res.status(200).json({ data: updatedUser });
  }
);

// @desc    Deactivate logged user
// @route   DELETE /api/v1/users/deleteMe
// @access  Private/Protect
export const deleteLoggedUserData = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    await User.findByIdAndUpdate(req.user?._id, { active: false });

    res.status(204).json({ status: "Success" });
  }
);
