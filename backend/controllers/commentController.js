import Comment from "../models/Comment.js";

export async function createComment(req, res) {
  try {
    const { taskId } = req.params;
    const { content } = req.body;
    const userId = req.user._id;

    const comment = await Comment.create({
      content,
      task: taskId,
      author: userId,
    });
    await comment.populate("author", "firstName lastName email");
    return res.status(201).json(comment);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to create comment",
    });
  }
}

export async function getComments(req, res) {
  try {
    const { taskId } = req.params;

    const comments = await Comment.find({
      task: taskId,
    })
      .populate("author", "firstName lastName email")
      .sort({ createdAt: 1 });

    return res.status(200).json(comments);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to get comments",
    });
  }
}

export async function updateComment(req, res) {
  try {
    const { commentId } = req.params;
    const { content } = req.body;

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({
        message: "Comment not found",
      });
    }

    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "You can only edit your own comments",
      });
    }

    comment.content = content;

    await comment.save();
    await comment.populate("author", "firstName lastName email");

    return res.status(200).json(comment);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to update comment",
    });
  }
}

export async function deleteComment(req, res) {
  try {
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({
        message: "Comment not found",
      });
    }

    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "You can only delete your own comments",
      });
    }

    await comment.deleteOne();

    return res.status(200).json({
      message: "Comment deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to delete comment",
    });
  }
}
