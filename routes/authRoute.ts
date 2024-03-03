const express = require("express");
import { signupValidator, loginValidator } from "../validators/authValidator";

import {
  signup,
  login,
  forgotPassword,
  verifyPassResetCode,
  resetPassword,
} from "../services/authService";

const router = express.Router();

router.post("/signup", signupValidator, signup);
router.post("/login", loginValidator, login);
router.post("/forgotPassword", forgotPassword);
router.post("/verifyResetCode", verifyPassResetCode);
router.put("/resetPassword", resetPassword);

export default router;
