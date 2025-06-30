import { Router } from "express";
const router = Router();
import authenticate from "../middlewares/auth.middleware.js";
import { followUser, unfollowUser } from "../controllers/followController.js";

router.post("/follow", authenticate, followUser);
router.post("/unfollow", authenticate, unfollowUser);

export default router;
