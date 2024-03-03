import { Request, Response, NextFunction } from "express";
import { body, check, ValidationChain } from "express-validator";
import validatorMiddleware from "../middlewares/validatorMiddleware";
import slugify from "slugify";

type RequestHandler = (req: Request, res: Response, next: NextFunction) => any;

export const getSubCategoryValidator: RequestHandler[] = [
  check("id")
    .isMongoId()
    .withMessage("Invalid subCategory id format") as ValidationChain,

  validatorMiddleware as RequestHandler,
];

export const createSubCategoryValidator: RequestHandler[] = [
  check("name")
    .notEmpty()
    .withMessage("SubCategory required")
    .isLength({ min: 2 })
    .withMessage("Too short subCategory name")
    .isLength({ max: 32 })
    .withMessage("Too long subCategory name")
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }) as ValidationChain,
  check("category")
    .notEmpty()
    .withMessage("SubCategory must be belong to a category")
    .isMongoId()
    .withMessage("Invalid Category id format"),
  validatorMiddleware as RequestHandler,
];

export const updateSubCategoryValidator: RequestHandler[] = [
  check("id")
    .isMongoId()
    .withMessage("Invalid subCategory id format") as ValidationChain,
  body("name").custom((val, { req }) => {
    req.body.slug = slugify(val);
    return true;
  }) as ValidationChain,

  validatorMiddleware as RequestHandler,
];

export const deleteSubCategoryValidator: RequestHandler[] = [
  check("id")
    .isMongoId()
    .withMessage("Invalid subCategory id format") as ValidationChain,

  validatorMiddleware as RequestHandler,
];
