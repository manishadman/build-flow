import express from "express";
import { protect } from "../middleware/protect.js";
import {
  createTag,
  getTags,
  updateTag,
  deleteTag,
} from "../controllers/tagController.js";
import {
  requireProjectMember,
  requireProjectRole,
} from "../middleware/projectAuthorization.js";

import { requireTagAccess } from "../middleware/tagAuthorization.js";

const router = express.Router();

router.use(protect);

router.get("/projects/:projectId/tags", requireProjectMember, getTags);

router.post(
  "/projects/:projectId/tags",
  requireProjectMember,
  requireProjectRole("OWNER", "ADMIN"),
  createTag,
);

router.patch(
  "/tags/:tagId",
  requireTagAccess,
  requireProjectRole("OWNER", "ADMIN"),
  updateTag,
);

router.delete(
  "/tags/:tagId",
  requireTagAccess,
  requireProjectRole("OWNER", "ADMIN"),
  deleteTag,
);

export default router;
