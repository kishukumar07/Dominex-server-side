import mongoose, { version } from "mongoose";
import bcrypt from 'bcrypt';


//UserSchema 
const UserSchema = new mongoose.Schema({

    groups: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group'
    }],
    followers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    followings: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    name: {
        type: String,
        required: true
    },
    contestsParticipated: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Contest'
    }],
    username: {
        type: String,
        required: true,
        unique: true
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
    profilePic: {
        type: String,
        default: 'default-profile.png' // You can set a default profile picture
    },
    bannerPic: {
        type: String,
        default: 'default-banner.png' // You can set a default banner picture
    },
    bio: {
        type: String,
        maxLength: [500, 'Bio cannot be more than 500 characters']
    },
    dateOfBirth: {
        type: Date
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
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other', 'Prefer not to say']
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    posts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
    }],
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
    stories: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Story'
    }]
}, {
    timestamps: true,
    versionKey: false  
}); 




//PRE_HOOK_MONGOOSE_MIDDLEWARE
UserSchema.pre("save", async (next) => {
    // Only hash the password if it's modified 
    if (!this.isModified("password")) return next();
    try {
        // Only hash the password if it's modified
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(this.password, salt);
        //modifying the password to hashed password 
        this.password = hashedPassword;
        next();
    } catch (err) {
        next(err);
    }
})


//Password Comparison Method 
UserSchema.methods.comparePassword = function (password) {
    return bcrypt.compare(password, this.password);
};



//UserModel 
const UserModel = mongoose.model("User", UserSchema);


export default UserModel;