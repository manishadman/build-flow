import express from "express";
import { protect } from "../middleware/protect.js";
import {
  createOrganization,
  getOrganizations,
  getOrganization,
  updateOrganization,
  deleteOrganization,
} from "../controllers/organizationController.js";

import {
  addOrganizationMember,
  getOrganizationMembers,
  updateOrganizationMember,
  removeOrganizationMember,
} from "../controllers/organizationMemberController.js";

import {
  requireOrganizationMember,
  requireOrganizationRole,
} from "../middleware/organizationAuthorization.js";

const router = express.Router();

router.use(protect);

// Organizations
router.get("/organizations", getOrganizations);

router.post("/organizations", createOrganization);

router.get(
  "/organizations/:organizationId",
  requireOrganizationMember,
  getOrganization,
);

router.patch(
  "/organizations/:organizationId",
  requireOrganizationMember,
  requireOrganizationRole("OWNER", "ADMIN"),
  updateOrganization,
);

router.delete(
  "/organizations/:organizationId",
  requireOrganizationMember,
  requireOrganizationRole("OWNER"),
  deleteOrganization,
);

router.get(
  "/organizations/:organizationId/members",
  requireOrganizationMember,
  getOrganizationMembers,
);

router.post(
  "/organizations/:organizationId/members",
  requireOrganizationMember,
  requireOrganizationRole("OWNER", "ADMIN"),
  addOrganizationMember,
);

router.patch(
  "/organizations/:organizationId/members/:userId",
  requireOrganizationMember,
  requireOrganizationRole("OWNER", "ADMIN"),
  updateOrganizationMember,
);

router.delete(
  "/organizations/:organizationId/members/:userId",
  requireOrganizationMember,
  requireOrganizationRole("OWNER", "ADMIN"),
  removeOrganizationMember,
);

export default router;
