import { Request, Response, NextFunction } from "express";
import SubCategory from "../models/subCategoryModel";
import {
  deleteOne,
  updateOne,
  createOne,
  getOne,
  getAll,
} from "./handlersFactory";

export const setCategoryIdToBody = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  //Nested route
  if (!req.body.category) req.body.category = req.params.categoryId;
  next();
};

//@dec    Create subCategory
//@route  POST /api/v1/subCategories
//@access private/Admin-Manager
export const createSubCategory = createOne(SubCategory);

// @desc    Get list of SubCategories
// @route   GET /api/v1/subcategories
// @access  Public
export const getSubCategories = getAll(SubCategory);

// @dec    GET specific SubCategories by id
// @route  GET /api/v1/subcategories/:id
// @access public
export const getSubCategory = getOne(SubCategory);

// @desc    Update specific SubCategory
// @route   PUT /api/v1/subcategories/:id
// @access  Private/Admin-Manager
export const updateSubCategory = updateOne(SubCategory);

// @desc Delete SubCategory
// @route   DELETE /api/v1/subcategories/:id
// @access  Private/Admin
export const deleteSubCategory = deleteOne(SubCategory);
