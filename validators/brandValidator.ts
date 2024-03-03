import { Request, Response, NextFunction } from "express";
import { body, check, ValidationChain } from "express-validator";
import validatorMiddleware from "../middlewares/validatorMiddleware";
import slugify from "slugify";

type RequestHandler = (req: Request, res: Response, next: NextFunction) => any;

export const getBrandValidator: RequestHandler[] = [
  check("id")
    .isMongoId()
    .withMessage("Invalid Brand id format") as ValidationChain,

  validatorMiddleware as RequestHandler,
];

export const createBrandValidator: RequestHandler[] = [
  check("name")
    .notEmpty()
    .withMessage("Brand required")
    .isLength({ min: 3 })
    .withMessage("Too short Brand name")
    .isLength({ max: 32 })
    .withMessage("Too long Brand name")
    .custom((val: string, { req }: any) => {
      req.body.slug = slugify(val);
      return true;
    }) as ValidationChain,

  validatorMiddleware as RequestHandler,
];

export const updateBrandValidator: RequestHandler[] = [
  check("id")
    .isMongoId()
    .withMessage("Invalid Brand id format") as ValidationChain,
  body("name").custom((val, { req }) => {
    req.body.slug = slugify(val);
    return true;
  }) as ValidationChain,
  validatorMiddleware as RequestHandler,
];

export const deleteBrandValidator: RequestHandler[] = [
  check("id")
    .isMongoId()
    .withMessage("Invalid Brand id format") as ValidationChain,

  validatorMiddleware as RequestHandler,
];
