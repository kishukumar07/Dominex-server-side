import mongoose from "mongoose";
import env from 'dotenv' ; 
env.config();   //using globally 
import connectDB from "./src/config/db.js";



import User from "./src/models/user.model.js"; 
import Post from "./src/models/post.model.js";
import Comment from "./src/models/comment.model.js";
import Like from "./src/models/like.model.js";
import Message from "./src/models/message.model.js";
import Notification from "./src/models/notification.model.js";
import Follower from "./src/models/follower.model.js";


const createUser = async () => {
    try {
      const user = new User({
        username: "Nidfdkevvt",
        email: "niket@edfdfxample.com",
        password: "secudfdrepassword",
        profilePicture: "https://example.com/image.jpg",
        bio: "Web Dedfveloper",
        followers: [],
        following: []
      });
      const savedUser = await user.save();
      console.log("✅ User Created:", savedUser);
    } catch (error) {
      console.error("❌ Error Creating User:", error);
    }
  };
     createUser();

    
     connectDB();  // Connect to MongoDB


