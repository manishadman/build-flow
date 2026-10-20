import ProjectMembership from "../models/ProjectMembership.js";

export async function requireProjectMember(req, res, next) {
  try {
    const { projectId } = req.params;

    const membership = await ProjectMembership.findOne({
      user: req.user._id,
      project: projectId,
    });

    if (!membership) {
      return res.status(403).json({
        message: "You do not have access to this project",
      });
    }

    req.projectMembership = membership;

    next();
  } catch (error) {
    return res.status(500).json({
      message: "Failed to verify project access",
    });
  }
}

export function requireProjectRole(...allowedRoles) {
  return function (req, res, next) {
    const membership = req.projectMembership;

    if (!membership || !allowedRoles.includes(membership.role)) {
      return res.status(403).json({
        message: "You do not have permission to perform this action",
      });
    }

    next();
  };
}
