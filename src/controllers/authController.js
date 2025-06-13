import UserModel from "../models/user.models.model.js";
import { setToken } from '../utils/auth/token.js';
import generateOtp from "../utils/auth/generateOtp.js";
import sendEmail from '../utils/mail/mailer.js'


const register = async (req, res) => {
    try {
        const { name, username, email, phone, password } = req.body;

        // Check if user already exists
        const existingUser = await UserModel.findOne({
            $or: [{ email }, { phone }, { username }]
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists with this email, phone, or username"
            });
        }

        const otpCred = generateOtp();
        // Create new user 
        const newUser = await UserModel.create({
            name,
            username,
            email,
            phone,
            password,
            isVerified: false,

            otp: otpCred.otp,
            otpExpire: otpCred.otpExpire
        });

        const token = setToken(newUser._id, res);

        sendEmail({
            email: newUser.email, emailType: "OTP", val: {
                otp: otpCred.otp
            }
        });


        // Remove password from response
        newUser.password = undefined;

        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            token
        });

    } catch (error) {
        // Mongoose validation errors
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: "Validation Error",
                error: Object.values(error.errors).map(err => err.message)
            });
        }

        console.error("Registration error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
}








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

        const isValidPassword = user.comparePassword(password);

        if (!isValidPassword) {
            return res.status(401).json({ message: "Incorrect Password" });
        }

        const token = setToken(user._id, res);
        // console.log(user);       // Mongoose Document
        // console.log(user._doc);  // Plain JavaScript object with the actual data
        const userData = { ...user._doc };
        delete userData.password;

        res.status(200).json({ message: 'Logged in successfull', data: userData, token });

    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Internal server error",
            err: err.message
        });

    }
}



const verify = async (req, res) => {
    const { otp } = req.body;
    const userId = req.userId;

    try {
        if (!otp || !userId) {
            return res.status(400).json({ message: 'Otp and UserId required' });
        }
        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const isOtpValid = user.otp === otp && user.otpExpire > Date.now();
        if (!isOtpValid) {
            return res.status(401).json({ message: 'Invalid or Expire OTP' });

        }
        user.otp = null;
        user.otpExpire = null;
        user.isVerified = true;
        await user.save();
        res.status(200).json({ message: 'User verified successfully', data: user });
    } catch (err) {
        res.status(500).json({ message: "Internal server error", error: err.message });
    }
}



const logout = () => {

}



export {
    register,
    login,
    verify,
    logout
}