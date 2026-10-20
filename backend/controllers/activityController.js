import Activity from "../models/Activity.js";

export async function getTaskActivity(req, res) {
  try {
    const { taskId } = req.params;

    const activities = await Activity.find({
      entityType: "TASK",
      entityId: taskId,
    })
      .populate("actor", "firstName lastName email")
      .sort({ createdAt: -1 });

    return res.status(200).json(activities);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to get task activity",
    });
  }
}

export async function getProjectActivity(req, res) {
  try {
    const { projectId } = req.params;

    const activities = await Activity.find({
      project: projectId,
    })
      .populate("actor", "firstName lastName email")
      .sort({ createdAt: -1 });

    return res.status(200).json(activities);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to get project activity",
    });
  }
}
