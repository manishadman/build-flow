import Project from "../models/Project.js";
import ProjectMembership from "../models/ProjectMembership.js";
import Task from "../models/Task.js";
import Comment from "../models/Comment.js";
import Tag from "../models/Tag.js";
import Activity from "../models/Activity.js";

// =========================
// CREATE PROJECT
// =========================

export async function createProject(req, res) {
  try {
    const { organizationId } = req.params;

    const { name, description, status, startDate, dueDate } = req.body;

    const userId = req.user._id;

    const project = await Project.create({
      name,
      description,
      organization: organizationId,
      status,
      startDate,
      dueDate,
      createdBy: userId,
    });

    await ProjectMembership.create({
      user: userId,
      project: project._id,
      role: "OWNER",
    });

    return res.status(201).json(project);
  } catch (error) {
    console.error("CREATE PROJECT ERROR:", error);

    return res.status(500).json({
      message: "Failed to create project",
    });
  }
}

// =========================
// GET PROJECTS
// =========================

export async function getProjects(req, res) {
  try {
    const { organizationId } = req.params;

    const projects = await Project.find({
      organization: organizationId,
    });

    return res.status(200).json(projects);
  } catch (error) {
    console.error("GET PROJECTS ERROR:", error);

    return res.status(500).json({
      message: "Failed to get projects",
    });
  }
}

// =========================
// GET ONE PROJECT
// =========================

export async function getProject(req, res) {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    return res.status(200).json(project);
  } catch (error) {
    console.error("GET PROJECT ERROR:", error);

    return res.status(500).json({
      message: "Failed to get project",
    });
  }
}

// =========================
// UPDATE PROJECT
// =========================

export async function updateProject(req, res) {
  try {
    const { projectId } = req.params;

    const allowedFields = [
      "name",
      "description",
      "status",
      "startDate",
      "dueDate",
    ];

    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const project = await Project.findByIdAndUpdate(projectId, updates, {
      new: true,
      runValidators: true,
    });

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    return res.status(200).json(project);
  } catch (error) {
    console.error("UPDATE PROJECT ERROR:", error);

    return res.status(500).json({
      message: "Failed to update project",
    });
  }
}

// =========================
// DELETE PROJECT
// =========================

export async function deleteProject(req, res) {
  try {
    const { projectId } = req.params;

    // First make sure the project exists.
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    // Find every task belonging to this project.
    // We need their IDs so we can delete their comments.
    const tasks = await Task.find({
      project: projectId,
    }).select("_id");

    const taskIds = tasks.map((task) => task._id);

    // Delete comments belonging to the project's tasks.
    if (taskIds.length > 0) {
      await Comment.deleteMany({
        task: {
          $in: taskIds,
        },
      });
    }

    // Delete all tasks in the project.
    await Task.deleteMany({
      project: projectId,
    });

    // Delete all tags in the project.
    await Tag.deleteMany({
      project: projectId,
    });

    // Delete all project memberships.
    await ProjectMembership.deleteMany({
      project: projectId,
    });

    // Delete all activity belonging to the project.
    await Activity.deleteMany({
      project: projectId,
    });

    // Finally delete the project itself.
    await project.deleteOne();

    return res.status(200).json({
      message: "Project deleted successfully",
    });
  } catch (error) {
    console.error("DELETE PROJECT ERROR:", error);

    return res.status(500).json({
      message: "Failed to delete project",
    });
  }
}
