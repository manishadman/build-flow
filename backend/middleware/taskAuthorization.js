import Task from "../models/Task.js";
import ProjectMembership from "../models/ProjectMembership.js";

export async function requireTaskAccess(req, res, next) {
  try {
    const { taskId } = req.params;

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    const membership = await ProjectMembership.findOne({
      user: req.user._id,
      project: task.project,
    });

    if (!membership) {
      return res.status(403).json({
        message: "You do not have access to this task",
      });
    }

    req.task = task;
    req.projectMembership = membership;

    next();
  } catch (error) {
    return res.status(500).json({
      message: "Failed to verify task access",
    });
  }
}
