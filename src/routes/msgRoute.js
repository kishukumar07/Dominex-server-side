import { Router } from "express";
import authenticate from "../middlewares/auth.middleware.js";
import { getMessages } from "../controllers/msgController.js";

const router = Router();
router.use(authenticate);

/**
 * GET /api/messages/:userId1/:userId2
 * Fetch paginated conversation history.
 *
 * Query:
 *   ?limit=30             — number of messages (default 30)
 *   ?before=<ISO date>    — cursor for scroll-up pagination
 */
router.get("/:userId1/:userId2", getMessages);

export default router;
