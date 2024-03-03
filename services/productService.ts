import Product from "../models/productModel";
import {
  deleteOne,
  updateOne,
  createOne,
  getOne,
  getAll,
} from "./handlersFactory";

// @desc    Get list of products
// @route   GET /api/v1/products
// @access  Public
export const getProducts = getAll(Product);

// @dec    GET specific products by id
// @route  GET /api/v1/products/:id
// @access public
export const getProduct = getOne(Product);
//@dec    Create product
//@route  POST /api/v1/products
//@access private/Admin-Manager
export const createProduct = createOne(Product);
// @desc    Update specific product
// @route   PUT /api/v1/products/:id
// @access  Private/Admin-Manager
export const updateProduct = updateOne(Product);

// @desc Delete product
// @route   DELETE /api/v1/products/:id
// @access  Private/Admin
export const deleteProduct = deleteOne(Product);
