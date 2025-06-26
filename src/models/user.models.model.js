import mongoose from "mongoose";
import bcrypt from "bcrypt";

const UserSchema = new mongoose.Schema(
  {
    // 👤 Personal Details
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minLength: [2, "Name must be at least 2 characters"],
      maxLength: [50, "Name must not exceed 50 characters"],
    },
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      minLength: [3, "Username must be at least 3 characters"],
      maxLength: [30, "Username must not exceed 30 characters"],
      match: [
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers, and underscores",
      ],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/.+@.+\..+/, "Please enter a valid email address"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      unique: true,
      trim: true,
      match: [/^\d{10}$/, "Phone number must be exactly 10 digits"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minLength: [6, "Password must be at least 6 characters"],
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other", "Prefer not to say"],
      default: "Prefer not to say",
    },
    dateOfBirth: {
      type: Date,
      validate: {
        validator: function (value) {
          return value < new Date(); // DOB should be in the past
        },
        message: "Date of birth must be in the past",
      },
    },
    bio: {
      type: String,
      trim: true,
      maxLength: [500, "Bio cannot be more than 500 characters"],
    },
    websiteUrl: {
      type: String,
      trim: true,
      validate: {
        validator: function (v) {
          return (
            !v ||
            /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(v)
          );
        },
        message: "Please enter a valid URL",
      },
    },
    profilePic: {
      type: String,
      default: "default-profile.png",
    },
    bannerPic: {
      type: String,
      default: "default-banner.png",
    },

    // 🔐 Account Info
    isVerified: {
      type: Boolean,
      default: false,
    },
    isPrivate: {
      type: Boolean,
      default: false,
    },
   otp: {
  type: String,
  validate: {
    validator: function (v) {
      return !v || /^\d{6}$/.test(v);
    },
    message: "OTP must be a 6-digit number",
  },
},
    otpExpire: {
      type: Date,
    },

    // Fields for email update process
    emailUpdateOtp: {
      type: String,
      default: null,
    },
    emailUpdateOtpExpire: {
      type: Date,
      default: null,
    },
    pendingNewEmail: {
      type: String,
      default: null,
    },

    refreshToken: {
      type: String,

      select: false, // Hide this field in queries unless explicitly selected
    },
    refreshTokenExpiry: {
      type: Date,
    },

    // 🌐 Social Connections
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: [],
      },
    ],
    followings: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: [],
      },
    ],
    groups: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group",
        default: [],
      },
    ],

    // 📝 User Activity
    posts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
        default: [],
      },
    ],
    stories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Story",
        default: [],
      },
    ],
    //   contestsParticipated: [
    //     {
    //       type: mongoose.Schema.Types.ObjectId,
    //       ref: "Contest",
    //       default: [],
    //     },
    //   ],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// 🔒 Pre-save middleware for hashing password
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// 🔐 Method to compare password
UserSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

const UserModel = mongoose.model("User", UserSchema);
export default UserModel;
