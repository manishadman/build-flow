import express from "express";
import { protect } from "../middleware/protect.js";
import {
  getTask,
  createTask,
  getTasks,
  updateTask,
  deleteTask,
} from "../controllers/taskController.js";

import {
  requireProjectMember,
  requireProjectRole,
} from "../middleware/projectAuthorization.js";

import { requireTaskAccess } from "../middleware/taskAuthorization.js";

const router = express.Router();

router.use(protect);

router.get("/projects/:projectId/tasks", requireProjectMember, getTasks);

router.post("/projects/:projectId/tasks", requireProjectMember, createTask);

router.get("/tasks/:taskId", requireTaskAccess, getTask);

router.patch("/tasks/:taskId", requireTaskAccess, updateTask);

router.delete(
  "/tasks/:taskId",
  requireTaskAccess,
  requireProjectRole("OWNER", "ADMIN"),
  deleteTask,
);
export default router;
