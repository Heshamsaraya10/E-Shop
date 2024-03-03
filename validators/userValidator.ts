import { Request, Response, NextFunction } from "express";
import { body, check, ValidationChain } from "express-validator";
import validatorMiddleware from "../middlewares/validatorMiddleware";
import slugify from "slugify";
import bcrypt from "bcrypt";

import User from "../models/userModel";

type RequestHandler = (req: Request, res: Response, next: NextFunction) => any;

export const createUserValidator: RequestHandler[] = [
  check("name")
    .notEmpty()
    .withMessage("User required")
    .isLength({ min: 3 })
    .withMessage("Too short User name")
    .custom((val: string, { req }: any) => {
      req.body.slug = slugify(val);
      return true;
    }) as ValidationChain,

  check("email")
    .notEmpty()
    .withMessage("Email required")
    .isEmail()
    .withMessage("Invalid email address")
    .custom((val: string) =>
      User.findOne({ email: val }).then((user) => {
        if (user) {
          return Promise.reject(new Error("E-mail already in use"));
        }
      })
    ),

  check("password")
    .notEmpty()
    .withMessage("Password required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters")
    .custom((password, { req }) => {
      if (password !== req.body.passwordConfirm) {
        throw new Error("Password Confirmation incorrect");
      }
      return true;
    }),

  check("passwordConfirm")
    .notEmpty()
    .withMessage("Password confirmation required"),

  check("phone")
    .optional()
    .isMobilePhone(["ar-EG", "ar-SA"])
    .withMessage("Invalid phone number only accepted Egy and SA Phone numbers"),

  check("profileImg").optional(),
  check("role").optional(),
  validatorMiddleware as RequestHandler,
];

export const getUserValidator: RequestHandler[] = [
  check("id")
    .isMongoId()
    .withMessage("Invalid User id format") as ValidationChain,
  validatorMiddleware as RequestHandler,
];

export const changeUserPasswordValidator: RequestHandler[] = [
  check("id").isMongoId().withMessage("Invalid User id format"),
  body("currentPassword")
    .notEmpty()
    .withMessage("You must enter your current password"),
  body("passwordConfirm")
    .notEmpty()
    .withMessage("You must enter the password confirm"),
  body("password")
    .notEmpty()
    .withMessage("You must enter new password")
    .custom(async (val, { req }) => {
      // 1) Verify current password
      const user = await User.findById(req.params?.id);
      if (!user) {
        throw new Error("There is no user for this id");
      }
      const isCorrectPassword = await bcrypt.compare(
        req.body.currentPassword,
        user.password
      );
      if (!isCorrectPassword) {
        throw new Error("Incorrect current password");
      }

      // 2) Verify password confirm
      if (val !== req.body.passwordConfirm) {
        throw new Error("Password Confirmation incorrect");
      }
      return true;
    }),
  validatorMiddleware as RequestHandler,
];

export const updateUserValidator: RequestHandler[] = [
  check("id")
    .isMongoId()
    .withMessage("Invalid User id format") as ValidationChain,
  body("name").custom((val, { req }) => {
    req.body.slug = slugify(val);
    return true;
  }) as ValidationChain,
  check("email")
    .notEmpty()
    .withMessage("Email required")
    .isEmail()
    .withMessage("Invalid email address")
    .custom((val) =>
      User.findOne({ email: val }).then((user) => {
        if (user) {
          return Promise.reject(new Error("E-mail already in user"));
        }
      })
    ),
  check("phone")
    .optional()
    .isMobilePhone(["ar-EG", "ar-SA"])
    .withMessage("Invalid phone number only accepted Egy and SA Phone numbers"),
  validatorMiddleware as RequestHandler,
];

export const deleteUserValidator: RequestHandler[] = [
  check("id")
    .isMongoId()
    .withMessage("Invalid User id format") as ValidationChain,

  validatorMiddleware as RequestHandler,
];


export const updateLoggedUserValidator: RequestHandler[] = [
  body("name").custom((val, { req }) => {
    req.body.slug = slugify(val);
    return true;
  }) as ValidationChain,
  check("email")
    .notEmpty()
    .withMessage("Email required")
    .isEmail()
    .withMessage("Invalid email address")
    .custom((val) =>
      User.findOne({ email: val }).then((user) => {
        if (user) {
          return Promise.reject(new Error("E-mail already in user"));
        }
      })
    ),
  check("phone")
    .optional()
    .isMobilePhone(["ar-EG", "ar-SA"])
    .withMessage("Invalid phone number only accepted Egy and SA Phone numbers"),
  validatorMiddleware as RequestHandler,
];