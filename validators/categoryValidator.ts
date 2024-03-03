import { Request, Response, NextFunction } from "express";
import { body, check, ValidationChain } from "express-validator";
import validatorMiddleware from "../middlewares/validatorMiddleware";
import slugify from "slugify";

type RequestHandler = (req: Request, res: Response, next: NextFunction) => any;

export const getCategoryValidator: RequestHandler[] = [
  check("id")
    .isMongoId()
    .withMessage("Invalid category id format") as ValidationChain,

  validatorMiddleware as RequestHandler,
];

export const createCategoryValidator: RequestHandler[] = [
  check("name")
    .notEmpty()
    .withMessage("Category required")
    .isLength({ min: 3 })
    .withMessage("Too short category name")
    .isLength({ max: 32 })
    .withMessage("Too long category name")
    .custom((val: string, { req }: any) => {
      req.body.slug = slugify(val);
      return true;
    }) as ValidationChain,

  validatorMiddleware as RequestHandler,
];

export const updateCategoryValidator: RequestHandler[] = [
  check("id")
    .isMongoId()
    .withMessage("Invalid category id format") as ValidationChain,
  body("name").custom((val, { req }) => {
    req.body.slug = slugify(val);
    return true;
  }) as ValidationChain,
  validatorMiddleware as RequestHandler,
];

export const deleteCategoryValidator: RequestHandler[] = [
  check("id")
    .isMongoId()
    .withMessage("Invalid category id format") as ValidationChain,

  validatorMiddleware as RequestHandler,
];
