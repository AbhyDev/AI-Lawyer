import jwt from "jsonwebtoken";
import { User } from "../schemas/userSchema.js";

// Middleware to verify JWT and protect routes
export const verifyJWT = async (req, res, next) => {
  try {
    console.log("Verifying JWT...");
    // Get the access token from cookies or headers
    const accessToken =
      req.cookies?.accessToken || req.headers.authorization?.split(" ")[1];
    console.log("Access Token:", accessToken);
    if (!accessToken) {
      return res.status(403).json({ message: "Unauthorized Access: No token provided" });
    }

    // Decode the access token to get user info stored in it
    const decodedToken = jwt.verify(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET
    );
    console.log("Decoded Token:", decodedToken);

    // If no valid user found, return Error
    const user = await User.findById(decodedToken._id).select(
      "-password -refreshToken"
    );
    console.log("User found:", user);
    if (!user) {
      return res.status(403).json({ message: "Unauthorized Access: User not found" });
    }
    // Add the user info to the request to be used by the other middlewares/routes
    req.user = user;
    next();
  } catch (error) {
    console.error("JWT Verification Error:", error);
    return res.status(403).json({ message: "Unauthorized Access: Invalid token" });
  }
};
