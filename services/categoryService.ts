import Category from "../models/categoryModel";
import {
  deleteOne,
  updateOne,
  createOne,
  getOne,
  getAll,
} from "./handlersFactory";

// @desc    Get list of categories
// @route   GET /api/v1/categories
// @access  Public
export const getCategories = getAll(Category);

// @dec    GET specific categories by id
// @route  GET /api/v1/categories/:id
// @access public
export const getCategory = getOne(Category);

//@dec    Create category
//@route  POST /api/v1/categories
//@access private/Admin-Manager
export const createCategory = createOne(Category);

// @desc    Update specific category
// @route   PUT /api/v1/categories/:id
// @access  Private/Admin-Manager
export const updateCategory = updateOne(Category);

// @desc Delete category
// @route   DELETE /api/v1/categories/:id
// @access  Private/Admin
export const deleteCategory = deleteOne(Category);
