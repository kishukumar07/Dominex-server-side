import { Router } from "express";
import {
  userProfile,
  updateUserInfo,
  updatePassword,

 requestResetEmail,
  resetPassword,
  
  updateEmail,
  updatePhone,
} from "../controllers/userController.js";
import authenticate from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/profile/:id", authenticate, userProfile);
router.patch("/:id", authenticate, updateUserInfo);
router.patch("/:id/password", authenticate, updatePassword);

//have to done...#resetPassword
router.post("/requestResetEmail",authenticate ,requestResetEmail); 

router.patch("/:id/passwordReset", authenticate, resetPassword);


//have to done...
router.patch("/:id/email", authenticate, updateEmail);
//have to done ...
router.patch("/:id/phone", authenticate, updatePhone);

export default router;
