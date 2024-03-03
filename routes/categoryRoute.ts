import { protect } from "./../services/authService";
import { Router, RequestHandler } from "express";
import {
  getCategoryValidator,
  createCategoryValidator,
  updateCategoryValidator,
  deleteCategoryValidator,
} from "../validators/categoryValidator";

import {
  createCategory,
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory,
} from "../services/categoryService";

import * as authService from "../services/authService";

import subCategoryRoute from "./subCategoryRoute";

const router: Router = Router();

router.use("/:categoryId/subcategories", subCategoryRoute);

router
  .route("/")
  .get(getCategories as RequestHandler)
  .post(
    authService.protect,
    authService.allowedTo("admin", "manager"),
    createCategoryValidator,
    createCategory as RequestHandler
  );
router
  .route("/:id")
  .get(getCategoryValidator, getCategory as RequestHandler)
  .put(
    authService.protect,
    authService.allowedTo("admin", "manager"),
    updateCategoryValidator,
    updateCategory as RequestHandler
  )
  .delete(
    authService.protect,
    authService.allowedTo("admin"),
    deleteCategoryValidator,
    deleteCategory as RequestHandler
  );

export default router;
