// controllers/authController.js
import asyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js"; // note the .js if using ES modules
import { Knock } from "@knocklabs/node";

// Initialize Knock client
const getKnock = () => {
  if (!process.env.KNOCK_API_KEY) {
    console.warn("Knock API Key is missing!");
    return null;
  }
  return new Knock({ apiKey: process.env.KNOCK_API_KEY });
};

// Helper to identify user in Knock (upsert)
const identifyUserInKnock = async (userId, name, email) => {
  try {
    const knock = getKnock();
    if (!knock) return;

    // Identify/upsert user in Knock
    await knock.users.identify(userId, {
      name,
      email,
    });
    console.log(`Knock: User ${userId} identified successfully`);
  } catch (error) {
    // Don't fail auth if Knock identification fails
    console.warn(`Knock: Failed to identify user ${userId}:`, error.message);
  }
};

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "30d",
  });
};

// @desc   Register new user
// @route  POST /api/auth/register
// @access Public
export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please provide name, email, and password");
  }

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error("User already exists with this email");
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    roles: ["user"],
  });

  if (!user) {
    res.status(400);
    throw new Error("Invalid user data");
  }

  // Identify user in Knock (non-blocking)
  identifyUserInKnock(user._id.toString(), user.name, user.email);

  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    roles: user.roles,
    token: generateToken(user._id),
  });
});

// @desc   Login user
// @route  POST /api/auth/login
// @access Public
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Please provide email and password");
  }

  const user = await User.findOne({ email });

  if (!user) {
    res.status(401);
    throw new Error("Invalid credentials");
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    res.status(401);
    throw new Error("Invalid credentials");
  }

  // Identify user in Knock on login (ensures user exists in Knock)
  identifyUserInKnock(user._id.toString(), user.name, user.email);

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    token: generateToken(user._id),
  });
});

// @desc   Get current user
// @route  GET /api/auth/me
// @access Private
export const getMe = asyncHandler(async (req, res) => {
  // req.user should be set by protect middleware
  if (!req.user) {
    res.status(401);
    throw new Error("Not authorized");
  }
  res.json(req.user);
});

// @desc   Logout user
// @route  POST /api/auth/logout
// @access Public (client usually deletes token)
export const logoutUser = asyncHandler(async (req, res) => {
  // With stateless JWTs, logout is client-side (remove the token).
  // Optionally you can implement token blacklisting on server if needed.
  res.json({ message: "Logged out successfully" });
});

// @desc   Update user password
// @route  PUT /api/auth/update-password
// @access Private
export const updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (!(await bcrypt.compare(currentPassword, user.password))) {
    res.status(401);
    throw new Error("Invalid current password");
  }

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(newPassword, salt);
  await user.save();

  res.json({ message: "Password updated successfully" });
});
