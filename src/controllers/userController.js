import UserModel from "../models/user.models.model.js";
import generateOtp from "../utils/auth/generateOtp.js";
import sendmail from "../utils/mail/mailer.js";

import mongoose from "mongoose";

const userProfile = async (req, res) => {
  const userid = req.params.id;
  // console.log(req.params)

  if (!mongoose.Types.ObjectId.isValid(userid)) {
    return res.status(400).json({
      success: false,
      msg: "Invalid user ID format",
    });
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
    // .populate('followers', 'username profilePic')
    // .populate('followings', 'username profilePic')
    // .populate('posts');

    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User doesn't exist",
      });
    }

    return res.status(200).json({
      success: true,
      msg: "User profile fetched successfully",
      data: user,
    });
  } catch (error) {
    // console.error("Error fetching user profile:", error);
    return res.status(500).json({
      success: false,
      msg: "Server error while fetching user profile",
      error: error.message,
    });
  }
};

const updateUserInfo = async (req, res) => {
  //also authorization check here ...
  const u_id = req.userId;
  const givenUserid = req.params.id;

  if (u_id !== givenUserid) {
    return res.status(403).json({
      success: false,
      msg: "You are not authorized to update this user's information",
    });
  }

  try {
    const data = req.body;

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

    // Filter only allowed fields
    const updates = {};
    for (let key of allowedFields) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }
    const user = await UserModel.findByIdAndUpdate(
      u_id,
      { ...updates },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      msg: "User information updated successfully",
      data: user,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      msg: "Server error while updating user information",
      error: err.message,
    });
  }
};

const updatePassword = async (req, res) => {
  // Old password verification required
  // Secure password hashing
  // Cannot be used to update anything else

  const givenUserid = req.params.id;
  const u_id = req.userId;
  if (u_id !== givenUserid) {
    return res.status(403).json({
      success: false,
      msg: "You are not authorized to change this user's password",
    });
  }

  // Expected req.body structure:
  // {
  //   oldPassword: String, // user's current password
  //   newPassword: String  // user's new password
  // }
  const { oldPassword, newPassword } = req.body;
  // console.log(!oldPassword )

  if (!oldPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      msg: "Both old and new passwords are required",
    });
  }

  try {
    const user = await UserModel.findById(u_id).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "user not found",
      });
    }

    const isValidPassword = await user.comparePassword(oldPassword);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        msg: "Incorrect Password",
      });
    }
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      msg: "Password updated successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      msg: "Server error while Updating the password ",
      error: err.message,
    });
  }
};

//have to do this thing ...
const requestResetEmail = async (req, res) => {
  const { email, phone, username } = req.body;

  if (!email && !phone && !username) {
    return res.status(400).json({
      success: false,
      msg: "Please input right Credentials",
    });
  }

  try {
    const user = await UserModel.findOne({
      $or: [{ email }, { phone }, { username }],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found",
      });
    }

    const otpCrud = generateOtp();
    user.otp = otpCrud.otp;
    user.otpExpire = otpCrud.expire;
    await user.save();

    const emailType = "RESET_PASSWORD";
    const info = await sendmail({
      email: user.email,
      emailType,
      val: otpCrud.otp,
    });

    const userId = user._id;

    return res.status(200).json({
      success: true,
      userId,
      info,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      msg: "Internal Server Error",
      error: err.message,
    });
  }
}; //this will send email with otp

//redirection to

const resetPassword = async (req, res) => {
  const { otp, userId, newpassword } = req.body;

  if (!otp) {
    return res.status(400).json({
      success: false,
      msg: "No Otp Provided",
    });
  }
  if (!userId) {
    return res.status(400).json({
      success: false,
      msg: "No userId Provided",
    });
  }
  if (!newpassword) {
    return res.status(400).json({
      success: false,
      msg: "Enter the new Password",
    });
  }

  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found",
      });
    }

    //   if verified then well reset password
    const isVerified = otp === user.otp && user.otpExpire > Date.now();

    if (!isVerified) {
      return res.status(400).json({
        success: false,
        msg: "Invalid or Expired Otp",
      });   
    }

    user.password = newpassword;
    user.otp = null;
    user.otpExpire = null;
    user.isVerified = true;
    await user.save();

    res.status(200).json({
      success: true,
      msg: "Password updated successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      msg: err.message,
    });
  }
}; //the otp and new pass should be passed and reset happens

//emailupdate
// Step 1: Request to update email (send OTP to new email)
const updateEmail = async (req, res) => {
  const { newEmail } = req.body;
  if (!newEmail) {
    return res.status(400).json({
      success: false,
      msg: "Please enter newEmail",
    });
  }

  const userId = req.userId;
  try {
    // Check if new email is already in use
    const existing = await UserModel.findOne({ email: newEmail });
    if (existing) {
      return res.status(409).json({
        success: false,
        msg: "Email already in use",
      });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found",
      });
    }

    // Generate OTP and expiry
    const otpCrud = generateOtp();
    user.emailUpdateOtp = otpCrud.otp;
    user.emailUpdateOtpExpire = otpCrud.expire;
    user.pendingNewEmail = newEmail;
    await user.save();

    // Send OTP to new email
    await sendmail({
      email: newEmail,
      emailType: "UPDATE_EMAIL",
      val: otpCrud.otp,
    });

    return res.status(200).json({
      success: true,
      msg: "OTP sent to new email. Please verify to update email.",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      msg: "Server error while requesting email update",
      error: err.message,
    });
  }
};

// Step 2: Verify OTP and update email
const verifyUpdateEmailOtp = async (req, res) => {
  const { otp } = req.body;
  const userId = req.userId;

  if (!otp) {
    return res.status(400).json({
      success: false,
      msg: "OTP is required",
    });
  }

  try {
    const user = await UserModel.findById(userId);
    if (
      !user ||
      !user.emailUpdateOtp ||
      !user.emailUpdateOtpExpire ||
      !user.pendingNewEmail
    ) {
      return res.status(400).json({
        success: false,
        msg: "No pending email update request",
      });
    }

    const isValid =
      otp === user.emailUpdateOtp && user.emailUpdateOtpExpire > Date.now();

    if (!isValid) {
      return res.status(400).json({
        success: false,
        msg: "Invalid or expired OTP",
      });
    }

    // Update email
    user.email = user.pendingNewEmail;
    user.pendingNewEmail = undefined;
    user.emailUpdateOtp = undefined;
    user.emailUpdateOtpExpire = undefined;
    await user.save();

    return res.status(200).json({
      success: true,
      msg: "Email updated successfully",
      data: { email: user.email },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      msg: "Server error while verifying OTP",
      error: err.message,
    });
  }
};


//remaining... 

const updatePhone = (req, res) => {};

export {
  userProfile,
  updateUserInfo,
  updatePassword,
  requestResetEmail,
  resetPassword,
  updateEmail, 
  updatePhone,
};
