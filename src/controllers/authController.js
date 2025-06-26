import UserModel from "../models/user.models.model.js";
import { setToken } from "../utils/auth/token.js";
import generateOtp from "../utils/auth/generateOtp.js";
import sendEmail from "../utils/mail/mailer.js";

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
        message: "User already exists with this email, phone, or username",
      });
    }

    const otpCred = generateOtp();

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
  await  sendEmail({
      email: newUser.email,
      emailType: "OTP",
      val: { otp: otpCred.otp },
    });

    newUser.password = undefined; // remove from response
  const token = setToken(newUser._id);

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: newUser,
      token
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        error: Object.values(error.errors).map((err) => err.message),
      });
    }

    console.error("Registration error:", error);
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

    const token = setToken(user._id);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
      },
      token,
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

const logout = () => {};

export { register, login, verify, logout };
