import Brand from "../models/brandModel";
import {
  deleteOne,
  updateOne,
  createOne,
  getOne,
  getAll,
} from "./handlersFactory";

// // @desc    Get list of brands
// // @route   GET /api/v1/brands
// // @access  Public
export const getBrands = getAll(Brand);

// // @dec    GET specific brands by id
// // @route  GET /api/v1/brands/:id
// // @access public
export const getBrand = getOne(Brand);
// //@dec    Create brand
// //@route  POST /api/v1/brands
// //@access private/Admin-Manager
export const createBrand = createOne(Brand);

// // @desc    Update specific brand
// // @route   PUT /api/v1/brands/:id
// // @access  Private/Admin-Manager
export const updateBrand = updateOne(Brand);

// @desc    Delete specific brand
// @route   DELETE /api/v1/brands/:id
// @access  Private
export const deleteBrand = deleteOne(Brand);
