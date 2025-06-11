import { Router } from "express";
import {
  getAllUsers,
  getUserById,
  updateUser,
  updateUserPassword,
  deleteUser
}
  from "../controllers/userController.js";
import authenticate from "../middlewares/auth.middleware.js";





const router = Router();


router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.put('/', authenticate, updateUser);
router.put('/password', authenticate, updateUserPassword);
router.delete('/', authenticate, deleteUser); 
