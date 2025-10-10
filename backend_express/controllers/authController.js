import { User } from "../schemas/userSchema.js";
import jwt from "jsonwebtoken";



export const asyncHandler = (fn) => {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (err) {
      next(err);
    }
  };
};

// User Registration
const registerUser = asyncHandler(async (req, res) => {
  const { username, password, role } = req.body;

  if (!username || !password || !role) {
    return res
      .status(400)
      .json({ message: "Username, password, and role are required" });
  }

  // Check if user already exists
  const existingUser = await User.findOne({ $or: [{ username }] });
  if (existingUser) {
    return res.status(409).json({ message: "Username already exists" });
  }

  // Create user
  const user = await User.create({
    username,
    password,
    role,
  });

  // Get Created User and remove Password and refreshToken fields
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    return res
      .status(500)
      .json({ message: "Something went wrong while registering User" });
  }

  // Send response
  return res.status(200).json({
    message: "User Registered Successfully",
    user: createdUser,
  });
});

// User Login
const loginUser = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and Password are required" });
  }

  // Check if user exists
  const user = await User.findOne({ username });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  // Check if Password matches
  if (!(await user.verifyPassword(password))) {
    return res.status(401).json({ message: "Username or Password invalid" });
  }

  // Generate Refresh Token and Access Token
  const refreshToken = user.generateRefreshToken();
  const accessToken = user.generateAccessToken();
  await User.findByIdAndUpdate(user._id, {
    refreshToken: refreshToken,
  });

  // Send tokens in response body
  res.json({
    user: user,
    accessToken: accessToken,
    refreshToken: refreshToken,
    message: "User logged in successfully"
  });
});

// Logout User
const logoutUser = asyncHandler(async (req, res) => {
  const user = req.user;
  // Revoke Refresh Token of currently logged in User (verifyJWT handles user extraction)
  await User.findByIdAndUpdate(user._id, {
    refreshToken: null,
  });

  // Send Response
  res
    .clearCookie("refreshToken")
    .clearCookie("accessToken")
    .json({ message: "User logged out successfully" });
});

// Renew Access Token
const renewTokens = asyncHandler(async (req, res) => {
  // Get refresh token sent in cookie
  const refreshToken = req.cookies?.refreshToken;
  if (!refreshToken) {
    return res.status(403).json({ message: "Unauthorized Access" });
  }

  // Decode refresh token to get user_id stored in it
  const decodedToken = jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET
  );

  // Get user and check validity of refresh token
  const user = await User.findById(decodedToken._id);
  if (!user || user?.refreshToken !== refreshToken) {
    return res.status(403).json({ message: "Unauthorized Access" });
  }

  // Generate and send a new Access Token as httpOnly cookie
  const newAccessToken = user.generateAccessToken();
  res
    .cookie("accessToken", newAccessToken, cookieOptions)
    .send({ message: "Access Token Renewed Successfully" });
});

const getLoggedInUser = asyncHandler(async (req, res) => {
  const user = req.user;
  res.send({ user, message: "User fetched successfully" });
});

export { registerUser, loginUser, logoutUser, renewTokens, getLoggedInUser };
