import express from "express";

import {
  getProjectActivity,
  getTaskActivity,
} from "../controllers/activityController.js";

import { protect } from "../middleware/protect.js";

import { requireProjectMember } from "../middleware/projectAuthorization.js";

import { requireTaskAccess } from "../middleware/taskAuthorization.js";

const router = express.Router();

router.use(protect);

router.get(
  "/projects/:projectId/activity",
  requireProjectMember,
  getProjectActivity,
);

router.get("/tasks/:taskId/activity", requireTaskAccess, getTaskActivity);

export default router;
