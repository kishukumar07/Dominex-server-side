import { Router } from "express";
const router = Router();
import authentication from "../middlewares/auth.middleware.js";
import { getMessages, sendMessage } from "../controllers/msgController.js";

router.use(authentication);

router.post("/send", sendMessage);
router.get("/:userId1/:userId2", getMessages);

export default router;
