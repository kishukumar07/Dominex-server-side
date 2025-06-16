import { Router } from "express";
import {
userProfile
}
  from "../controllers/userController.js";
import authenticate from "../middlewares/auth.middleware.js";





const router = Router();


router.get('/profile/:id',userProfile);











export default router ; 