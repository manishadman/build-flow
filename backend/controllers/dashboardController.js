import ProjectMembership from "../models/ProjectMembership.js";
import Task from "../models/Task.js";

export async function getDashboard(req, res) {
  try {
    const userId = req.user._id;

    const memberships = await ProjectMembership.find({
      user: userId,
    }).populate("project");

    const projects = memberships.map((membership) => membership.project);

    const assignedTasks = await Task.find({
      assignee: userId,
    })
      .populate("project", "name")
      .sort({ dueDate: 1 });

    const overdueTasks = await Task.find({
      assignee: userId,
      dueDate: {
        $lt: new Date(),
      },
      status: {
        $ne: "DONE",
      },
    })
      .populate("project", "name")
      .sort({ dueDate: 1 });

    const completedTaskCount = await Task.countDocuments({
      assignee: userId,
      status: "DONE",
    });

    return res.status(200).json({
      projects,
      assignedTasks,
      overdueTasks,

      stats: {
        projectCount: projects.length,
        assignedTaskCount: assignedTasks.length,
        overdueTaskCount: overdueTasks.length,
        completedTaskCount,
      },
    });
  } catch (error) {
    console.error("DASHBOARD ERROR:", error);

    return res.status(500).json({
      message: "Failed to get dashboard",
    });
  }
}
