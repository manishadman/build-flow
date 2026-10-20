import Organization from "../models/Organization.js";
import OrganizationMembership from "../models/OrganizationMembership.js";
import Project from "../models/Project.js";
import ProjectMembership from "../models/ProjectMembership.js";
import Task from "../models/Task.js";
import Comment from "../models/Comment.js";
import Tag from "../models/Tag.js";
import Activity from "../models/Activity.js";

// =========================
// CREATE ORGANIZATION
// =========================

export async function createOrganization(req, res) {
  try {
    const { name, description } = req.body;
    const userId = req.user._id;

    const organization = await Organization.create({
      name,
      description,
    });

    await OrganizationMembership.create({
      user: userId,
      organization: organization._id,
      role: "OWNER",
    });

    return res.status(201).json(organization);
  } catch (error) {
    console.error("CREATE ORGANIZATION ERROR:", error);

    return res.status(500).json({
      message: "Failed to create organization",
    });
  }
}

// =========================
// GET ORGANIZATIONS
// =========================

export async function getOrganizations(req, res) {
  try {
    const userId = req.user._id;

    const memberships = await OrganizationMembership.find({
      user: userId,
    }).populate("organization");

    const organizations = memberships
      .map((membership) => membership.organization)
      .filter(Boolean);

    return res.status(200).json(organizations);
  } catch (error) {
    console.error("GET ORGANIZATIONS ERROR:", error);

    return res.status(500).json({
      message: "Failed to get organizations",
    });
  }
}

// =========================
// GET ONE ORGANIZATION
// =========================

export async function getOrganization(req, res) {
  try {
    const { organizationId } = req.params;

    const organization = await Organization.findById(organizationId);

    if (!organization) {
      return res.status(404).json({
        message: "Organization not found",
      });
    }

    return res.status(200).json(organization);
  } catch (error) {
    console.error("GET ORGANIZATION ERROR:", error);

    return res.status(500).json({
      message: "Failed to get organization",
    });
  }
}

// =========================
// UPDATE ORGANIZATION
// =========================

export async function updateOrganization(req, res) {
  try {
    const { organizationId } = req.params;

    const allowedFields = ["name", "description"];

    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const organization = await Organization.findByIdAndUpdate(
      organizationId,
      updates,
      {
        new: true,
        runValidators: true,
      },
    );

    if (!organization) {
      return res.status(404).json({
        message: "Organization not found",
      });
    }

    return res.status(200).json(organization);
  } catch (error) {
    console.error("UPDATE ORGANIZATION ERROR:", error);

    return res.status(500).json({
      message: "Failed to update organization",
    });
  }
}

// =========================
// DELETE ORGANIZATION
// =========================

export async function deleteOrganization(req, res) {
  try {
    const { organizationId } = req.params;

    // 1. Make sure the organization exists.
    const organization = await Organization.findById(organizationId);

    if (!organization) {
      return res.status(404).json({
        message: "Organization not found",
      });
    }

    // 2. Find every project in this organization.
    const projects = await Project.find({
      organization: organizationId,
    }).select("_id");

    const projectIds = projects.map((project) => project._id);

    // 3. Find every task in those projects.
    let taskIds = [];

    if (projectIds.length > 0) {
      const tasks = await Task.find({
        project: {
          $in: projectIds,
        },
      }).select("_id");

      taskIds = tasks.map((task) => task._id);
    }

    // 4. Delete comments belonging to those tasks.
    if (taskIds.length > 0) {
      await Comment.deleteMany({
        task: {
          $in: taskIds,
        },
      });
    }

    // 5. Delete tasks belonging to those projects.
    if (projectIds.length > 0) {
      await Task.deleteMany({
        project: {
          $in: projectIds,
        },
      });

      // 6. Delete tags belonging to those projects.
      await Tag.deleteMany({
        project: {
          $in: projectIds,
        },
      });

      // 7. Delete project memberships.
      await ProjectMembership.deleteMany({
        project: {
          $in: projectIds,
        },
      });

      // 8. Delete project activity.
      await Activity.deleteMany({
        project: {
          $in: projectIds,
        },
      });

      // 9. Delete the projects themselves.
      await Project.deleteMany({
        _id: {
          $in: projectIds,
        },
      });
    }

    // 10. Delete organization memberships.
    await OrganizationMembership.deleteMany({
      organization: organizationId,
    });

    // 11. Finally delete the organization.
    await organization.deleteOne();

    return res.status(200).json({
      message: "Organization deleted successfully",
    });
  } catch (error) {
    console.error("DELETE ORGANIZATION ERROR:", error);

    return res.status(500).json({
      message: "Failed to delete organization",
    });
  }
}
