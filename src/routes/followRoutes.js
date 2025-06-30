import { Router } from "express";
const router = Router();
import authenticate from "../middlewares/auth.middleware";
import { followUser, unfollowUser } from "../controllers/followController";

router.post("/follow", authenticate, followUser);
router.post("/unfollow", authenticate, unfollowUser);

export default router;
