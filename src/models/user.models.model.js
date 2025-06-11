import mongoose from "mongoose";
import bcrypt from 'bcrypt';

const UserSchema = new mongoose.Schema({
    // 👤 Personal Details
    name: {
        type: String,
        required: true,
        trim: true
    },
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [/.+@.+\..+/, 'Please fill a valid email address']
    },
    password: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other', 'Prefer not to say']
    },
    dateOfBirth: {
        type: Date
    },
    bio: {
        type: String,
        maxLength: [500, 'Bio cannot be more than 500 characters'],
        trim: true
    },
    websiteUrl: {
        type: String,
        validate: {
            validator: function(v) {
                return /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(v);
            },
            message: 'Please enter a valid URL'
        }
    },
    profilePic: {
        type: String,
        default: 'default-profile.png'
    },
    bannerPic: {
        type: String,
        default: 'default-banner.png'
    },

    // 🔐 Account Info
    isVerified: {
        type: Boolean,
        default: false
    },
    isPrivate: {
        type: Boolean,
        default: false
    },
    otp: {
        type: Number
    },
    otpExpire: {
        type: Date
    },
    refreshToken: {
        type: String
    },
    refreshTokenExpiry: {
        type: Date
    },

    // 🌐 Social Connections
    followers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    followings: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    groups: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group'
    }],

    // 📝 User Activity
    posts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
    }],
    stories: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Story'
    }],
    contestsParticipated: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Contest'
    }]
}, {
    timestamps: true,
    versionKey: false
});

// Pre-save middleware for password hashing
UserSchema.pre("save", async function(next) {
    if (!this.isModified("password")) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});

// Password comparison method
UserSchema.methods.comparePassword = function(password) {
    return bcrypt.compare(password, this.password);
};

const UserModel = mongoose.model("User", UserSchema);

export default UserModel;