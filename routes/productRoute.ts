import { Router, RequestHandler } from "express";
import {
  getProductValidator,
  createProductValidator,
  updateProductValidator,
  deleteProductValidator,
} from "../validators/productValidator";

import {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
} from "../services/productService";
import * as authService from "../services/authService";

const router: Router = Router();

router
  .route("/")
  .get(getProducts as RequestHandler)
  .post(
    authService.protect,
    authService.allowedTo("admin", "manager"),
    createProductValidator,
    createProduct as RequestHandler
  );
router
  .route("/:id")
  .get(getProductValidator, getProduct as RequestHandler)
  .put(
    authService.protect,
    authService.allowedTo("admin", "manager"),
    updateProductValidator,
    updateProduct as RequestHandler
  )
  .delete(
    authService.protect,
    authService.allowedTo("admin"),
    deleteProductValidator,
    deleteProduct as RequestHandler
  );

export default router;
