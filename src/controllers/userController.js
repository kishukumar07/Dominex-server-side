import UserModel from '../models/user.models.model.js'


import mongoose from 'mongoose';


const userProfile = async (req, res) => {
  const userid = req.params.id;
// console.log(req.params)

  if (!mongoose.Types.ObjectId.isValid(userid)) {
    return res.status(400).json({
      success: false,
      msg: "Invalid user ID format"
    });
  }

  try {
    const user = await UserModel.findById(userid, {
      name: 1,
      username: 1,
      bio: 1,
      email:1, 
      profilePic: 1,
      bannerPic: 1,
      isVerified: 1,
      gender: 1,
      dateOfBirth: 1,
      websiteUrl: 1,
      followers: 1,
      followings: 1,
      posts: 1
    })
      // .populate('followers', 'username profilePic')
      // .populate('followings', 'username profilePic')
      // .populate('posts');

    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User doesn't exist"
      });
    }

    return res.status(200).json({
      success: true,
      msg: "User profile fetched successfully",
      data: user
    });

  } catch (error) {
    // console.error("Error fetching user profile:", error);
    return res.status(500).json({
      success: false,
      msg: "Server error while fetching user profile",
      error: error.message
    });
  }
};



















export {
userProfile 
}