import UserModel from "../models/user.models.model.js";
import generateOtp from "../utils/auth/generateOtp.js";
import sendmail from "../utils/mail/mailer.js";
import mongoose from "mongoose";

const userProfile = async (req, res) => {
  const userid = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(userid)) {
    return res
      .status(400)
      .json({ success: false, msg: "Invalid user ID format" });
  }

  try {
    const user = await UserModel.findById(userid, {
      name: 1,
      username: 1,
      bio: 1,
      email: 1,
      profilePic: 1,
      bannerPic: 1,
      isVerified: 1,
      gender: 1,
      dateOfBirth: 1,
      websiteUrl: 1,
      followers: 1,
      followings: 1,
      posts: 1,
    });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, msg: "User doesn't exist" });
    }

    return res.status(200).json({
      success: true,
      msg: "User profile fetched successfully",
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: "Server error while fetching user profile",
      error: error.message,
    });
  }
};

const updateUserInfo = async (req, res) => {
  console.log(1);
  const u_id = req.userId;
  const givenUserid = req.params.id;

  if (u_id !== givenUserid) {
    return res.status(403).json({ success: false, msg: "Not authorized" });
  }

  try {
    const allowedFields = [
      "name",
      "username",
      "bio",
      "profilePic",
      "bannerPic",
      "websiteUrl",
      "gender",
      "dateOfBirth",
    ];

    const updates = {};
    for (let key of allowedFields) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    const user = await UserModel.findByIdAndUpdate(u_id, updates, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return res.status(404).json({ success: false, msg: "User not found" });
    }

    res
      .status(200)
      .json({ success: true, msg: "User info updated", data: user });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, msg: "Update error", error: err.message });
  }
};

const updatePassword = async (req, res) => {
  const u_id = req.userId;
  const givenUserid = req.params.id;

  if (u_id !== givenUserid) {
    return res.status(403).json({ success: false, msg: "Not authorized" });
  }

  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res
      .status(400)
      .json({ success: false, msg: "Both Old and new Password Required" });
  }

  try {
    const user = await UserModel.findById(u_id).select("+password");
    if (!user)
      return res.status(404).json({ success: false, msg: "User not found" });

    const isValid = await user.comparePassword(oldPassword);
    if (!isValid)
      return res.status(401).json({ success: false, msg: "Wrong password" });

    user.password = newPassword;
    await user.save();

    res.status(200).json({ success: true, msg: "Password updated" });
  } catch (err) {
    res.status(500).json({
      success: false,
      msg: "Error updating password",
      error: err.message,
    });
  }
};

const requestResetEmail = async (req, res) => {
  const { email, phone, username } = req.body;

  if (!email && !phone && !username) {
    return res
      .status(400)
      .json({ success: false, msg: "Either Email,phone,username is Required" });
  }

  try {
    const user = await UserModel.findOne({
      $or: [{ email }, { phone }, { username }],
    });
    if (!user)
      return res.status(404).json({ success: false, msg: "User not found" });

    const otpData = generateOtp();
    user.otp = otpData.otp;
    user.otpExpire = otpData.expire;
    await user.save();

    const emailType = "RESET_PASSWORD";
    const info = await sendmail({
      email: user.email,
      emailType,
      val: otpData.otp,
    });

    res.status(200).json({ success: true, userId: user._id, info });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, msg: "Server error", error: err.message });
  }
};

const resetPassword = async (req, res) => {
  const { otp, newPassword } = req.body;
  const userId = req.params.id;
  // console.log(req.params);
  if (!otp) {
    return res.status(400).json({ success: false, msg: "OTP is required" });
  }
  if (!userId) {
    return res.status(400).json({ success: false, msg: "User ID is required" });
  }
  if (!newPassword) {
    return res
      .status(400)
      .json({ success: false, msg: "New password is required" });
  }

  try {
    const user = await UserModel.findById(userId);
    if (!user)
      return res.status(404).json({ success: false, msg: "User not found" });

    const isVerified = otp == user.otp && user.otpExpire > Date.now();
    if (!isVerified)
      return res
        .status(400)
        .json({ success: false, msg: "Invalid/expired OTP" });

    user.password = newPassword;
    user.otp = null;
    user.otpExpire = null;
    user.isVerified = true;
    await user.save();

    res.status(200).json({ success: true, msg: "Password reset successful" });
  } catch (err) {
    res.status(500).json({
      success: false,
      msg: "Error resetting password",
      error: err.message,
    });
  }
};

const updateEmail = async (req, res) => {
  const { newEmail } = req.body;
  const userId = req.userId;

  if (!newEmail)
    return res.status(400).json({ success: false, msg: "New email required" });
  //authorization
  if (req.params.id && req.params.id !== userId) {
    return res.status(403).json({ success: false, msg: "Unauthorized action" });
  }

  try {
    // Authorization: ensure the user is modifying only their own account
    const user = await UserModel.findById(userId);
    if (!user)
      return res.status(404).json({ success: false, msg: "User not found" });

    // Optional: if you accept userId in the body or params, verify identity

    const existing = await UserModel.findOne({ email: newEmail });
    if (existing)
      return res.status(409).json({ success: false, msg: "Email in use" });

    const otpData = generateOtp();
    user.emailUpdateOtp = otpData.otp;
    user.emailUpdateOtpExpire = otpData.expire;
    user.pendingNewEmail = newEmail;
    await user.save();

    const info = await sendmail({
      email: newEmail,
      emailType: "UPDATE_EMAIL",
      val: otpData,
    });

    res.status(200).json({ success: true, msg: "OTP sent to new email", info });
  } catch (err) {
    res.status(500).json({
      success: false,
      msg: "Error requesting email update",
      error: err.message,
    });
  }
};

const verifyUpdateEmailOtp = async (req, res) => {
  const { otp } = req.body;
  const userId = req.userId;

  if (!otp)
    return res.status(400).json({ success: false, msg: "OTP required" });
  //authorization
  if (req.params.id && req.params.id !== userId) {
    return res.status(403).json({ success: false, msg: "Unauthorized action" });
  }

  try {
    const user = await UserModel.findById(userId);
    if (
      !user ||
      !user.emailUpdateOtp ||
      !user.emailUpdateOtpExpire ||
      !user.pendingNewEmail
    ) {
      return res
        .status(400)
        .json({ success: false, msg: "No pending email update" });
    }

    const isValid =
      otp == user.emailUpdateOtp && user.emailUpdateOtpExpire > Date.now();
    if (!isValid)
      return res
        .status(400)
        .json({ success: false, msg: "Invalid/expired OTP" });

    user.email = user.pendingNewEmail;
    user.pendingNewEmail = undefined;
    user.emailUpdateOtp = undefined;
    user.emailUpdateOtpExpire = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      msg: "Email updated",
      data: { email: user.email },
    });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, msg: "Error verifying OTP", error: err.message });
  }
};

const updatePhone = (req, res) => {
  res
    .status(501)
    .json({ success: false, msg: "Phone update not implemented yet" });
};

export {
  userProfile,
  updateUserInfo,
  updatePassword,
  requestResetEmail,
  resetPassword,
  updateEmail,
  verifyUpdateEmailOtp,
  updatePhone,
};
