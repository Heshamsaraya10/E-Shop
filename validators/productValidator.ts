import { Request, Response, NextFunction } from "express";
import { body, check, ValidationChain } from "express-validator";
import slugify from "slugify";

import validatorMiddleware from "../middlewares/validatorMiddleware";
import Category from "../models/categoryModel";
import SubCategory from "../models/subCategoryModel";

type RequestHandler = (req: Request, res: Response, next: NextFunction) => any;

export const createProductValidator: RequestHandler[] = [
  check("title")
    .isLength({ min: 3 })
    .withMessage("must be at least 3 chars")
    .notEmpty()
    .withMessage("Product required")
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }) as ValidationChain,
  check("description")
    .notEmpty()
    .withMessage("Product description is required")
    .isLength({ max: 2000 })
    .withMessage("Too long description") as ValidationChain,
  check("quantity")
    .notEmpty()
    .withMessage("Product quantity is required")
    .isNumeric()
    .withMessage("Product quantity must be a number") as ValidationChain,
  check("sold")
    .optional()
    .isNumeric()
    .withMessage("Product quantity must be a number") as ValidationChain,
  check("price")
    .notEmpty()
    .withMessage("Product price is required")
    .isNumeric()
    .withMessage("Product price must be a number")
    .isLength({ max: 32 })
    .withMessage("To long price") as ValidationChain,
  check("priceAfterDiscount")
    .optional()
    .isNumeric()
    .withMessage("Product priceAfterDiscount must be a number")
    .toFloat()
    .custom((value, { req }) => {
      if (req.body.price <= value) {
        throw new Error("priceAfterDiscount must be lower than price");
      }
      return true;
    }) as ValidationChain,
  check("colors")
    .optional()
    .isArray()
    .withMessage(
      "availableColors should be array of string"
    ) as ValidationChain,
  check("imageCover")
    .notEmpty()
    .withMessage("Product imageCover is required") as ValidationChain,
  check("images")
    .optional()
    .isArray()
    .withMessage("images should be array of string") as ValidationChain,
  check("category")
    .notEmpty()
    .withMessage("Product must be belong to a category")
    .isMongoId()
    .withMessage("Invalid ID formate")

    .custom((categoryId) =>
      Category.findById(categoryId).then((category) => {
        if (!category) {
          return Promise.reject(
            new Error(`No category for this id: ${categoryId}`)
          );
        }
      })
    ) as ValidationChain,
  check("subcategories")
    .optional()
    .isMongoId()
    .withMessage("Invalid ID formate")

    .custom((subcategoriesIds) =>
      SubCategory.find({ _id: { $exists: true, $in: subcategoriesIds } }).then(
        (result) => {
          if (result.length < 1 || result.length !== subcategoriesIds.length) {
            return Promise.reject(new Error(`Invalid subcategories Ids`));
          }
        }
      )
    )

    .custom(async (val, { req }) => {
      const subcategories = await SubCategory.find({
        category: req.body.category,
      });
      const subCategoriesIdsInDB: string[] = subcategories.map((subCategory) =>
        subCategory._id.toString()
      );
      const checker = (target: any[], arr: any[]) =>
        target.every((v) => arr.includes(v));
      if (!checker(val, subCategoriesIdsInDB)) {
        throw new Error(`subcategories not belong to category`);
      }
    }) as ValidationChain,
  check("brand")
    .optional()
    .isMongoId()
    .withMessage("Invalid ID formate") as ValidationChain,
  check("ratingsAverage")
    .optional()
    .isNumeric()
    .withMessage("ratingsAverage must be a number")
    .isLength({ min: 1 })
    .withMessage("Rating must be above or equal 1.0")
    .isLength({ max: 5 })
    .withMessage("Rating must be below or equal 5.0") as ValidationChain,
  check("ratingsQuantity")
    .optional()
    .isNumeric()
    .withMessage("ratingsQuantity must be a number") as ValidationChain,

  validatorMiddleware as RequestHandler,
];

export const getProductValidator: RequestHandler[] = [
  check("id").isMongoId().withMessage("Invalid ID formate") as ValidationChain,
  validatorMiddleware as RequestHandler,
];

export const updateProductValidator: RequestHandler[] = [
  check("id").isMongoId().withMessage("Invalid ID formate") as ValidationChain,
  body("title")
    .optional()
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }) as ValidationChain,
  validatorMiddleware as RequestHandler,
];

export const deleteProductValidator: RequestHandler[] = [
  check("id").isMongoId().withMessage("Invalid id format") as ValidationChain,

  validatorMiddleware as RequestHandler,
];
