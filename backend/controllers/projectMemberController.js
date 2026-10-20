import ProjectMembership from "../models/ProjectMembership.js";
import Project from "../models/Project.js";
import OrganizationMembership from "../models/OrganizationMembership.js";

// ============================================================
// ADD PROJECT MEMBER
// ============================================================

export async function addProjectMember(req, res) {
  try {
    const { projectId } = req.params;
    const { userId, role } = req.body;

    // OWNER cannot be manually assigned.
    // The OWNER is established when the project is created.
    if (role === "OWNER") {
      return res.status(400).json({
        message: "OWNER role cannot be assigned through this endpoint",
      });
    }

    // Make sure the project exists.
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    // A user must belong to the organization
    // before they can belong to one of its projects.
    const organizationMembership = await OrganizationMembership.findOne({
      user: userId,
      organization: project.organization,
    });

    if (!organizationMembership) {
      return res.status(400).json({
        message:
          "User must belong to the organization before joining the project",
      });
    }

    // Check for an existing membership BEFORE trying to create one.
    const existingMembership = await ProjectMembership.findOne({
      user: userId,
      project: projectId,
    });

    if (existingMembership) {
      return res.status(409).json({
        message: "User is already a member of this project",
      });
    }

    // Create the membership.
    const membership = await ProjectMembership.create({
      user: userId,
      project: projectId,
      role,
    });

    // Populate user information before returning it.
    // This allows the frontend to immediately display
    // the member's name and email without refreshing.
    await membership.populate("user", "firstName lastName email");

    return res.status(201).json(membership);
  } catch (error) {
    console.error("ADD PROJECT MEMBER ERROR:", error);

    // Extra protection in case two requests arrive
    // almost simultaneously and MongoDB's unique
    // index catches the duplicate.
    if (error.code === 11000) {
      return res.status(409).json({
        message: "User is already a member of this project",
      });
    }

    return res.status(500).json({
      message: "Failed to add project member",
    });
  }
}

// ============================================================
// GET PROJECT MEMBERS
// ============================================================

export async function getProjectMembers(req, res) {
  try {
    const { projectId } = req.params;

    const members = await ProjectMembership.find({
      project: projectId,
    }).populate("user", "firstName lastName email");

    return res.status(200).json(members);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to get project members",
    });
  }
}

// ============================================================
// UPDATE PROJECT MEMBER
// ============================================================

export async function updateProjectMember(req, res) {
  try {
    const { projectId, userId } = req.params;
    const { role } = req.body;

    // OWNER cannot be assigned through this endpoint.
    if (role === "OWNER") {
      return res.status(400).json({
        message: "OWNER role cannot be assigned through this endpoint",
      });
    }

    // FIRST find the membership.
    // Do not update anything yet.
    const membership = await ProjectMembership.findOne({
      project: projectId,
      user: userId,
    });

    if (!membership) {
      return res.status(404).json({
        message: "Project membership not found",
      });
    }

    // Protect the existing OWNER before modifying anything.
    if (membership.role === "OWNER") {
      return res.status(403).json({
        message: "Project OWNER cannot be modified",
      });
    }

    // Now it is safe to change the role.
    membership.role = role;

    await membership.save();

    await membership.populate("user", "firstName lastName email");

    return res.status(200).json(membership);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to update project member",
    });
  }
}

// ============================================================
// REMOVE PROJECT MEMBER
// ============================================================

export async function removeProjectMember(req, res) {
  try {
    const { projectId, userId } = req.params;

    // FIRST find the membership.
    // Do not delete anything yet.
    const membership = await ProjectMembership.findOne({
      project: projectId,
      user: userId,
    });

    if (!membership) {
      return res.status(404).json({
        message: "Project membership not found",
      });
    }

    // Never allow the project OWNER to be removed.
    if (membership.role === "OWNER") {
      return res.status(403).json({
        message: "Project OWNER cannot be removed",
      });
    }

    // Now deletion is safe.
    await membership.deleteOne();

    return res.status(200).json({
      message: "Project member removed successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to remove project member",
    });
  }
}
