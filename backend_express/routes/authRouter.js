import { Router } from "express";
import jwt from "jsonwebtoken";
import { User } from "../schemas/userSchema.js";
import {
  registerUser,
  loginUser,
  logoutUser,
  renewTokens,
  getLoggedInUser,
} from "../controllers/authController.js";

// Middleware to verify JWT and protect routes
const verifyJWT = async (req, res, next) => {
  try {
    // Get the access token from cookies or headers
    const accessToken =
      req.cookies?.accessToken || req.headers.authorization?.split(" ")[1];
    if (!accessToken) {
      return res.status(403).json({ message: "Unauthorized Access" });
    }

    // Decode the access token to get user info stored in it
    const decodedToken = await jwt.verify(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET
    );
    // If no valid user found, return Error
    const user = await User.findById(decodedToken._id).select(
      "-password -refreshToken"
    );
    if (!user) {
      return res.status(403).json({ message: "Unauthorized Access" });
    }
    // Add the user info to the request to be used by the other middlewares/routes
    req.user = user;
    next();
  } catch (error) {
    console.error("JWT Verification Error:", error);
    return res.status(403).json({ message: "Unauthorized Access" });
  }
};

const router = Router();
// normal routes
router.route("/register").post(registerUser);
router.route("/login").post(loginUser);

// secured routes
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh-token").get(renewTokens);
router.route("/me").get(verifyJWT, getLoggedInUser);

export default router;
