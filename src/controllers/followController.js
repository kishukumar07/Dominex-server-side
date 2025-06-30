// controllers/followController.js
import UserModel from "../models/user.models.model.js";


const followUser = async (req, res) => {
  try {
    const currentUserId = req.userId;
    if (!req.body) {
      return res.status(400).json({ msg: "Invalid request" });
    }
    const { targetUserId } = req.body; //or req.params.id
    if (!targetUserId) {
      return res.status(400).json({ msg: "Invalid TargetUserId" });
    }
    if (currentUserId === targetUserId)
      return res.status(400).send("Cannot follow yourself");

    const currentUser = await UserModel.findById(currentUserId);
    const targetUser = await UserModel.findById(targetUserId);

    //a's id to b's followers ...
    //b's id to a's following ...
    if (!targetUser.followers.includes(currentUserId)) {
      targetUser.followers.push(currentUserId);
      currentUser.followings.push(targetUserId);

      await currentUser.save();
      await targetUser.save();
    }

    res.send("Followed successfully");
  } catch (err) {
    res.status(500).json({ success: false, err: err.message });
  }
};

const unfollowUser = async (req, res) => {
  try {
    const currentUserId = req.userId;
    if (!req.body) {
      return res.status(400).json({ msg: "Invalid request" });
    }
    const { targetUserId } = req.body; //or req.params.id
    if (!targetUserId) {
      return res.status(400).json({ msg: "Invalid targetUserId" });
    }
    const currentUser = await UserModel.findById(currentUserId);
    const targetUser = await UserModel.findById(targetUserId);

    targetUser.followers.pull(currentUserId);
    currentUser.followings.pull(targetUserId);

    await currentUser.save();
    await targetUser.save();

    res.send("Unfollowed successfully");
  } catch (err) {
    res.status(500).json({ success: false, err: err.message });
  }
};

export { followUser, unfollowUser };
