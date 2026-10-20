import express from "express";
import { protect } from "../middleware/protect.js";
import {
  createComment,
  getComments,
  updateComment,
  deleteComment,
} from "../controllers/commentController.js";
import { requireTaskAccess } from "../middleware/taskAuthorization.js";
import { requireCommentAccess } from "../middleware/commentAuthorization.js";

const router = express.Router();

router.use(protect);
router.get("/tasks/:taskId/comments", requireTaskAccess, getComments);

router.post("/tasks/:taskId/comments", requireTaskAccess, createComment);

router.patch("/comments/:commentId", requireCommentAccess, updateComment);

router.delete("/comments/:commentId", requireCommentAccess, deleteComment);
export default router;
