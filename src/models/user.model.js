import mongoose from "mongoose";

const userSchema=new mongoose.Schema({
  username: {
    type: String,
    // and soo on
  },
  // define all fields
},{timestamps:true});

const User=mongoose.model("User",userSchema);

export default User;