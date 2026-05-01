import UserModel from "../models/user.models.model.js";
import generateOtp from "../utils/auth/generateOtp.js";
import sendEmail from "../utils/mail/mailer.js";
import { setRefreshToken, getAcessToken } from "../utils/auth/token.js";
import { RefTokenModel } from "../models/tokens/refreshToken.js";
import jwt from "jsonwebtoken";

// import {BlacklistModel} from "../models/tokens/blcklist.model.js";

const register = async (req, res) => {
  try {
    if (!req.body) {
      return res
        .status(400)
        .json({ success: false, message: "Missing request body" });
    }

    const { name, username, email, phone, password } = req.body;

    if (!name || !username || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message:
          "All fields (name, username, email, phone, password) are required",
      });
    }

    // Check if user already exists
    const existingUser = await UserModel.findOne({
      $or: [{ email }, { phone }, { username }],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already Registered !",
      });
    }

    const otpCred = generateOtp();

    //DB first → Email second → rollback on failure
    const newUser = await UserModel.create({
      name,
      username,
      email,
      phone,
      password,
      isVerified: false,
      otp: otpCred.otp,
      otpExpire: otpCred.expire,
    });

    // Send OTP email

    try {
      await sendEmail({
        email: newUser.email,
        emailType: "OTP",
        val: { otp: otpCred.otp },
      });
    } catch (err) {
      await UserModel.findByIdAndDelete(newUser._id);
      throw err;
    }

    return res.status(201).json({
      success: true,
      message: "User registered. Please verify your email.",
      data: { _id: newUser._id, email: newUser.email },
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        error: Object.values(error.errors).map((err) => err.message),
      });
    }
    // console.error("Registration error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const login = async (req, res) => {
  const { email, phone, password } = req.body;

  try {
    if (!email && !phone) {
      return res.status(400).json({ message: "Email or Phone required" });
    }
    const user = await UserModel.findOne({ $or: [{ email }, { phone }] });

    if (!user) {
      return res.status(404).json({ message: "User not founded" });
    }

    const isValidPassword = await user.comparePassword(password);

    if (!isValidPassword) {
      return res.status(401).json({ message: "Incorrect Password" });
    }

    // Check verification status
    if (!user.isVerified) {
      // Generate new OTP for unverified users
      const otpCred = generateOtp();
      user.otp = otpCred.otp;
      user.otpExpire = otpCred.expire;
      await user.save();

      // Send new OTP
      await sendEmail({
        email: user.email,
        emailType: "OTP",
        val: { otp: otpCred.otp },
      });

      return res.status(403).json({
        success: false,
        message: "Email not verified. New OTP sent to your email.",
        userId: user._id,
      });
    }

    //acess token here ...
    await setRefreshToken(user._id, res);
    const accesstoken = getAcessToken(user._id);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
      },
      token: accessToken,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Internal server error",
      err: err.message,
    });
  }
};

const verify = async (req, res) => {
  const { otp } = req.body;
  const userId = req.userId;

  try {
    if (!otp || !userId) {
      return res.status(400).json({ message: "Otp and UserId required" });
    }
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // console.log(use)
    const isOtpValid = user.otp === otp && user.otpExpire > Date.now();
    if (!isOtpValid) {
      return res.status(401).json({ message: "Invalid or Expire OTP" });
    }
    user.otp = null;
    user.otpExpire = null;
    user.isVerified = true;
    await user.save();
    res.status(200).json({ message: "User verified successfully", data: user });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
};

const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies?.token;

    if (!refreshToken) {
      return res
        .status(400)
        .json({ success: false, msg: "Already logged out." });
    }

    // Remove refresh token from DB
    await RefTokenModel.findOneAndDelete({ token: refreshToken });

    // Clear the cookie
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    });

    return res
      .status(200)
      .json({ success: true, msg: "Logged out successfully." });
  } catch (err) {
    console.error("Logout error:", err.message);
    return res.status(500).json({ success: false, msg: "Logout failed." });
  }
};

const refresh = async (req, res) => {
  // Refresh flow —> cookie → verify JWT → check DB → generate new accessToken → return it
  const refreshToken = req.cookies?.token;

  if (!refreshToken) {
    return res.status(401).json({
      message: "Unauthorized ",
    });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    if (!(decoded && decoded.userId)) {
      return res
        .status(401)
        .json({
          message: "Unauthorized: Invalid Or Expired token",
          success: false,
        });
    }

    const existingToken = await RefTokenModel.findOne({ token: refreshToken });

    if (!existingToken) {
      return res
        .status(401)
        .json({
          message: "Unauthorized: Invalid Or Expired token",
          success: false,
        });
    }

    const token = getAcessToken(decoded.userId);

    return res.status(200).json({
      success: true,
      message: "TokenRefreshed successfully",
      token,
    });
  } catch (error) {
    return res
      .status(401)
      .json({
        message: "Unauthorized: Invalid Or Expired token",
        success: false,
      });
  }
};

export { register, verify, login, logout, refresh };
