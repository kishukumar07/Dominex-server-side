import { Router }  from "express";
import { register,login,logout} from "../controllers/authController.js";
import { verify } from "../controllers/authController.js";
import authMiddleware from '../middlewares/auth.middleware.js'
// import authRoute from '../routes/'

const router=Router(); 


router.post('/register',register); 
router.post('/login',login); 
router.post("/verifyOtp",authMiddleware,verify);
router.post('/logout',logout);  


export default router;
             