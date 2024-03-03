import { Router, RequestHandler } from "express";
import {
  getBrandValidator,
  createBrandValidator,
  updateBrandValidator,
  deleteBrandValidator,
} from "../validators/brandValidator";

import {
  createBrand,
  getBrands,
  getBrand,
  updateBrand,
  deleteBrand,
} from "../services/brandService";

import * as authService from "../services/authService";

const router: Router = Router();

router
  .route("/")
  .get(getBrands as RequestHandler)
  .post(
    authService.protect,
    authService.allowedTo("admin", "manager"),
    createBrandValidator,
    createBrand as RequestHandler
  );
router
  .route("/:id")
  .get(getBrandValidator, getBrand as RequestHandler)
  .put(
    authService.protect,
    authService.allowedTo("admin", "manager"),
    updateBrandValidator,
    updateBrand as RequestHandler
  )
  .delete(
    authService.protect,
    authService.allowedTo("admin"),
    deleteBrandValidator,
    deleteBrand as RequestHandler
  );

export default router;
