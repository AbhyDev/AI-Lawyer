import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  renewTokens,
  getLoggedInUser,
} from "../controllers/authController.js";
import { verifyJWT } from "../middleware/auth.js";

const router = Router();
// normal routes
router.route("/register").post(registerUser);
router.route("/login").post(loginUser);

// secured routes
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh-token").get(renewTokens);
router.route("/me").get(verifyJWT, getLoggedInUser);

export default router;
