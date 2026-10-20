import Tag from "../models/Tag.js";
import Task from "../models/Task.js";

// =========================
// CREATE TAG
// =========================

export async function createTag(req, res) {
  try {
    const { projectId } = req.params;
    const { name } = req.body;

    const existingTag = await Tag.findOne({
      project: projectId,
      name,
    });

    if (existingTag) {
      return res.status(409).json({
        message: "A tag with this name already exists in this project",
      });
    }

    const tag = await Tag.create({
      name,
      project: projectId,
    });

    return res.status(201).json(tag);
  } catch (error) {
    console.error("CREATE TAG ERROR:", error);

    // Backup protection in case two requests
    // attempt to create the same tag simultaneously.
    if (error.code === 11000) {
      return res.status(409).json({
        message: "A tag with this name already exists in this project",
      });
    }

    return res.status(500).json({
      message: "Failed to create tag",
    });
  }
}

// =========================
// GET TAGS
// =========================

export async function getTags(req, res) {
  try {
    const { projectId } = req.params;

    const tags = await Tag.find({
      project: projectId,
    }).sort({
      name: 1,
    });

    return res.status(200).json(tags);
  } catch (error) {
    console.error("GET TAGS ERROR:", error);

    return res.status(500).json({
      message: "Failed to get tags",
    });
  }
}

// =========================
// UPDATE TAG
// =========================

export async function updateTag(req, res) {
  try {
    const { tagId } = req.params;
    const { name } = req.body;

    const currentTag = await Tag.findById(tagId);

    if (!currentTag) {
      return res.status(404).json({
        message: "Tag not found",
      });
    }

    const duplicateTag = await Tag.findOne({
      project: currentTag.project,
      name,
      _id: {
        $ne: tagId,
      },
    });

    if (duplicateTag) {
      return res.status(409).json({
        message: "A tag with this name already exists in this project",
      });
    }

    currentTag.name = name;

    await currentTag.save();

    return res.status(200).json(currentTag);
  } catch (error) {
    console.error("UPDATE TAG ERROR:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        message: "A tag with this name already exists in this project",
      });
    }

    return res.status(500).json({
      message: "Failed to update tag",
    });
  }
}

// =========================
// DELETE TAG
// =========================

export async function deleteTag(req, res) {
  try {
    const { tagId } = req.params;

    const tag = await Tag.findById(tagId);

    if (!tag) {
      return res.status(404).json({
        message: "Tag not found",
      });
    }

    // Remove this tag from every task that currently uses it.
    await Task.updateMany(
      {
        tags: tagId,
      },
      {
        $pull: {
          tags: tagId,
        },
      },
    );

    await tag.deleteOne();

    return res.status(200).json({
      message: "Tag deleted successfully",
    });
  } catch (error) {
    console.error("DELETE TAG ERROR:", error);

    return res.status(500).json({
      message: "Failed to delete tag",
    });
  }
}
