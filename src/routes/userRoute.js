import { Router } from "express";
import {
  userProfile,
  updateUserInfo,
  updatePassword,
  requestResetEmail,
  resetPassword,
  updateEmail,
  verifyUpdateEmailOtp,
  updatePhone,
} from "../controllers/userController.js";
import authenticate from "../middlewares/auth.middleware.js";

const router = Router();

/**
 * @route PATCH /api/user/requestResetEmail
 * @desc Request OTP to reset password (via email/username/phone)
 * @access Public
 */
router.patch("/requestResetEmail", requestResetEmail);

/**
 * @route PATCH /api/user/:id/passwordReset
 * @desc Reset password with OTP
 * @access Public (only with valid OTP)
 */
router.patch("/:id/passwordReset", resetPassword);

/**
 * @route PATCH /api/user/updateEmail
 * @desc Request OTP to update email
 * @access Protected
 */
router.patch("/updateEmail", authenticate, updateEmail);

/**
 * @route PATCH /api/user/verifyNewEmailOtp
 * @desc Verify OTP and update email
 * @access Protected
 */
router.patch("/verifyNewEmailOtp", authenticate, verifyUpdateEmailOtp);

/**
 * @route PATCH /api/user/:id/phone
 * @desc Update phone (yet to implement)
 * @access Protected
 */
/**
 * @route GET /api/user/profile/:id
 * @desc Get user profile by ID
 * @access Protected
 */
router.get("/profile/:id", authenticate, userProfile);

/**
 * @route PATCH /api/user/:id
 * @desc Update user info (only by owner)
 * @access Protected
 */
router.patch("/:id", authenticate, updateUserInfo);

/**
 * @route PATCH /api/user/:id/password
 * @desc Update password (authenticated + old password required)
 * @access Protected
 */
router.patch("/:id/password", authenticate, updatePassword);

router.patch("/:id/phone", authenticate, updatePhone);

export default router;
