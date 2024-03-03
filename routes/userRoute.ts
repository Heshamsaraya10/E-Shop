import { Router, RequestHandler } from "express";
import {
  createUserValidator,
  getUserValidator,
  updateUserValidator,
  deleteUserValidator,
  changeUserPasswordValidator,
  updateLoggedUserValidator,
} from "../validators/userValidator";

import {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  changeUserPassword,
  getLoggedUserData,
  updateLoggedUserPassword,
  updateLoggedUserData,
  deleteLoggedUserData,
} from "../services/userService";
import * as authService from "../services/authService";

const router: Router = Router();

router.use(authService.protect);

router.get("/getMe", getLoggedUserData, getUser);
router.put("/changeMyPassword", updateLoggedUserPassword);
router.put("/updateMe", updateLoggedUserValidator, updateLoggedUserData);
router.delete("/deleteMe", deleteLoggedUserData);

router.use(authService.allowedTo("admin", "manager"));
//Admin
router.put(
  "/changePassword/:id",
  changeUserPasswordValidator,
  changeUserPassword
);
router
  .route("/")
  .get(getUsers as RequestHandler)
  .post(createUserValidator, createUser as RequestHandler);
router
  .route("/:id")
  .get(getUserValidator, getUser as RequestHandler)
  .put(updateUserValidator, updateUser as unknown as RequestHandler)
  .delete(deleteUserValidator, deleteUser as RequestHandler);

export default router;
