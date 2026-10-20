import Comment from "../models/Comment.js";
import Task from "../models/Task.js";
import ProjectMembership from "../models/ProjectMembership.js";

export async function requireCommentAccess(req, res, next) {
  try {
    const { commentId } = req.params;

    // Find the comment
    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({
        message: "Comment not found",
      });
    }

    // Find the task containing the comment
    const task = await Task.findById(comment.task);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    // Check whether the logged-in user belongs
    // to the project containing that task
    const membership = await ProjectMembership.findOne({
      user: req.user._id,
      project: task.project,
    });

    if (!membership) {
      return res.status(403).json({
        message: "You do not have access to this comment",
      });
    }

    // Save what we found for later code
    req.comment = comment;
    req.task = task;
    req.projectMembership = membership;

    next();
  } catch (error) {
    return res.status(500).json({
      message: "Failed to verify comment access",
    });
  }
}
