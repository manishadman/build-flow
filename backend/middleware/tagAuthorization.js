import Tag from "../models/Tag.js";
import ProjectMembership from "../models/ProjectMembership.js";

export async function requireTagAccess(req, res, next) {
  try {
    const { tagId } = req.params;

    const tag = await Tag.findById(tagId);

    if (!tag) {
      return res.status(404).json({
        message: "Tag not found",
      });
    }

    const membership = await ProjectMembership.findOne({
      user: req.user._id,
      project: tag.project,
    });

    if (!membership) {
      return res.status(403).json({
        message: "You do not have access to this tag",
      });
    }

    req.tag = tag;
    req.projectMembership = membership;

    next();
  } catch (error) {
    return res.status(500).json({
      message: "Failed to verify tag access",
    });
  }
}
