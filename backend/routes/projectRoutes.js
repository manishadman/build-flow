import express from "express";

import { protect } from "../middleware/protect.js";

import {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
} from "../controllers/projectController.js";

import {
  addProjectMember,
  getProjectMembers,
  updateProjectMember,
  removeProjectMember,
} from "../controllers/projectMemberController.js";

import {
  requireProjectMember,
  requireProjectRole,
} from "../middleware/projectAuthorization.js";

import {
  requireOrganizationMember,
  requireOrganizationRole,
} from "../middleware/organizationAuthorization.js";

const router = express.Router();

router.use(protect);

// -------------------------
// Organization → Projects
// -------------------------

router.get(
  "/organizations/:organizationId/projects",
  requireOrganizationMember,
  getProjects,
);

router.post(
  "/organizations/:organizationId/projects",
  requireOrganizationMember,
  requireOrganizationRole("OWNER", "ADMIN"),
  createProject,
);

// -------------------------
// Individual Project
// -------------------------

router.get("/projects/:projectId", requireProjectMember, getProject);

router.patch(
  "/projects/:projectId",
  requireProjectMember,
  requireProjectRole("OWNER", "ADMIN"),
  updateProject,
);

router.delete(
  "/projects/:projectId",
  requireProjectMember,
  requireProjectRole("OWNER"),
  deleteProject,
);

// -------------------------
// Project Members
// -------------------------

router.get(
  "/projects/:projectId/members",
  requireProjectMember,
  getProjectMembers,
);

router.post(
  "/projects/:projectId/members",
  requireProjectMember,
  requireProjectRole("OWNER", "ADMIN"),
  addProjectMember,
);

router.patch(
  "/projects/:projectId/members/:membershipId",
  requireProjectMember,
  requireProjectRole("OWNER", "ADMIN"),
  updateProjectMember,
);

router.delete(
  "/projects/:projectId/members/:membershipId",
  requireProjectMember,
  requireProjectRole("OWNER", "ADMIN"),
  removeProjectMember,
);

export default router;
