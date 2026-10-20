import { logActivity } from "../utils/logActivity.js";
import ProjectMembership from "../models/ProjectMembership.js";
import Task from "../models/Task.js";
import Comment from "../models/Comment.js";
import Activity from "../models/Activity.js";
import Tag from "../models/Tag.js";

// =========================
// GET ONE TASK
// =========================

export async function getTask(req, res) {
  try {
    const { taskId } = req.params;

    const task = await Task.findById(taskId)
      .populate("assignee", "firstName lastName email")
      .populate("createdBy", "firstName lastName email")
      .populate("tags", "name");

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    return res.status(200).json(task);
  } catch (error) {
    console.error("GET TASK ERROR:", error);

    return res.status(500).json({
      message: "Failed to get task",
    });
  }
}

// =========================
// CREATE TASK
// =========================

export async function createTask(req, res) {
  try {
    const { projectId } = req.params;

    const { title, description, status, priority, dueDate, assignee, tags } =
      req.body;

    const userId = req.user._id;

    // If an assignee is provided, they must
    // already belong to the project.
    if (assignee) {
      const assigneeMembership = await ProjectMembership.findOne({
        user: assignee,
        project: projectId,
      });

      if (!assigneeMembership) {
        return res.status(400).json({
          message: "Assignee must be a member of the project",
        });
      }
    }
    const uniqueTagIds = [...new Set(tags || [])];

    if (uniqueTagIds.length > 0) {
      const validTagCount = await Tag.countDocuments({
        _id: { $in: uniqueTagIds },
        project: projectId,
      });

      if (validTagCount !== uniqueTagIds.length) {
        return res.status(400).json({
          message: "All tags must belong to this project",
        });
      }
    }
    const task = await Task.create({
      title,
      description,
      status,
      priority,
      dueDate,
      project: projectId,
      createdBy: userId,
      assignee: assignee || null,
      tags: uniqueTagIds || [],
    });

    await logActivity({
      actor: userId,
      action: "TASK_CREATED",
      entityType: "TASK",
      entityId: task._id,
      project: projectId,
      details: {
        title: task.title,
      },
    });

    await task.populate("assignee", "firstName lastName email");

    await task.populate("createdBy", "firstName lastName email");

    await task.populate("tags", "name");

    return res.status(201).json(task);
  } catch (error) {
    console.error("CREATE TASK ERROR:", error);

    return res.status(500).json({
      message: "Failed to create task",
    });
  }
}

// =========================
// UPDATE TASK
// =========================

export async function updateTask(req, res) {
  try {
    const { taskId } = req.params;
    const userId = req.user._id;

    const allowedFields = [
      "title",
      "description",
      "status",
      "priority",
      "dueDate",
      "assignee",
      "tags",
    ];

    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    // Find task before modifying it.
    const oldTask = await Task.findById(taskId);

    if (!oldTask) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    // If changing the assignee to an actual user,
    // that user must belong to the project.
    if (updates.assignee) {
      const assigneeMembership = await ProjectMembership.findOne({
        user: updates.assignee,
        project: oldTask.project,
      });

      if (!assigneeMembership) {
        return res.status(400).json({
          message: "Assignee must be a member of the project",
        });
      }
    }

    // Allow the frontend to explicitly unassign a task.
    if (updates.assignee === "") {
      updates.assignee = null;
    }
    if (updates.tags !== undefined) {
      const uniqueTagIds = [...new Set(updates.tags || [])];

      if (uniqueTagIds.length > 0) {
        const validTagCount = await Tag.countDocuments({
          _id: { $in: uniqueTagIds },
          project: oldTask.project,
        });

        if (validTagCount !== uniqueTagIds.length) {
          return res.status(400).json({
            message: "All tags must belong to this project",
          });
        }
      }

      updates.tags = uniqueTagIds;
    }
    const task = await Task.findByIdAndUpdate(taskId, updates, {
      new: true,
      runValidators: true,
    })
      .populate("assignee", "firstName lastName email")
      .populate("createdBy", "firstName lastName email")
      .populate("tags", "name");

    // Log status changes.
    if (updates.status !== undefined && oldTask.status !== task.status) {
      await logActivity({
        actor: userId,
        action: "TASK_STATUS_CHANGED",
        entityType: "TASK",
        entityId: task._id,
        project: task.project,
        details: {
          oldStatus: oldTask.status,
          newStatus: task.status,
        },
      });
    }

    // Log priority changes.
    if (updates.priority !== undefined && oldTask.priority !== task.priority) {
      await logActivity({
        actor: userId,
        action: "TASK_PRIORITY_CHANGED",
        entityType: "TASK",
        entityId: task._id,
        project: task.project,
        details: {
          oldPriority: oldTask.priority,
          newPriority: task.priority,
        },
      });
    }

    return res.status(200).json(task);
  } catch (error) {
    console.error("UPDATE TASK ERROR:", error);

    return res.status(500).json({
      message: "Failed to update task",
    });
  }
}

// =========================
// DELETE TASK
// =========================

export async function deleteTask(req, res) {
  try {
    const { taskId } = req.params;

    // Find first. Do not delete anything until
    // we know the task actually exists.
    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    // Delete all comments belonging to this task.
    await Comment.deleteMany({
      task: taskId,
    });

    // Delete all activity records belonging to this task.
    await Activity.deleteMany({
      entityType: "TASK",
      entityId: taskId,
    });

    // Finally delete the task itself.
    await task.deleteOne();

    return res.status(200).json({
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error("DELETE TASK ERROR:", error);

    return res.status(500).json({
      message: "Failed to delete task",
    });
  }
}

// =========================
// GET PROJECT TASKS
// =========================

export async function getTasks(req, res) {
  try {
    const { projectId } = req.params;

    const { status, priority, assignee, tag, search, sort } = req.query;

    const query = {
      project: projectId,
    };

    if (status) {
      query.status = status;
    }

    if (priority) {
      query.priority = priority;
    }

    if (assignee) {
      query.assignee = assignee;
    }

    if (tag) {
      query.tags = tag;
    }

    if (search) {
      query.title = {
        $regex: search,
        $options: "i",
      };
    }

    let taskQuery = Task.find(query)
      .populate("assignee", "firstName lastName email")
      .populate("tags", "name");

    if (sort === "dueDate") {
      taskQuery = taskQuery.sort({
        dueDate: 1,
      });
    }

    if (sort === "-dueDate") {
      taskQuery = taskQuery.sort({
        dueDate: -1,
      });
    }

    if (sort === "createdAt") {
      taskQuery = taskQuery.sort({
        createdAt: 1,
      });
    }

    if (sort === "-createdAt") {
      taskQuery = taskQuery.sort({
        createdAt: -1,
      });
    }

    const tasks = await taskQuery;

    return res.status(200).json(tasks);
  } catch (error) {
    console.error("GET TASKS ERROR:", error);

    return res.status(500).json({
      message: "Failed to get tasks",
    });
  }
}
