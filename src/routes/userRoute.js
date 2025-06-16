import { Router } from "express";
import {
  userProfile,
  updateUserInfo,
  updatePassword,
} from "../controllers/userController.js";
import authenticate from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/profile/:id", authenticate, userProfile);
router.patch("/:id", authenticate, updateUserInfo);
router.patch("/:id/password" , authenticate , updatePassword);



export default router;
