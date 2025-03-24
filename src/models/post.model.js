import mongoose  from "mongoose";

const postSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    media: [{ type: String }], // Array of image/video URLs
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], 
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }]
  }, { timestamps: true });
  
  const Post = mongoose.model("Post", postSchema);
  export default Post;
  